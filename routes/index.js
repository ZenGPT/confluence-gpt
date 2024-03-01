import fetch from 'node-fetch';
import { findOrCreateClient, clientRunOutOfToken, deductClientToken } from '../service/client';
import * as DiagramSvc from '../service/diagram';

const ASK_API_URL = 'http://localhost:5001/v1/ask';
const ASK_API_AUTH_TOKEN = 'Bearer localhost';
const CLIENT_INFO_API_URL = 'http://localhost:5001/v1/client/info';
const OPENAI_BASEURL='https://gateway.ai.cloudflare.com/v1/8d5fc7ce04adc5096f52485cce7d7b3d/diagramly-ai/openai';
const SYSTEM_PROMPT = `You're a Mermaid diagram expert.`;
const USER_PROMPT = `Generate Mermaid DSL for the given sequence diagram image. Output the DSL in code block.`;

export default function routes(app, addon) {
  // Redirect root path to /atlassian-connect.json,
  // which will be served by atlassian-connect-express.
  app.get('/', (req, res) => {
    res.redirect('/atlassian-connect.json');
  });

  // This is an example route used by "generalPages" module (see atlassian-connect.json).
  // Verify that the incoming request is authenticated with Atlassian Connect.
  app.get('/show-dashboard', (req, res) => {
    return res.render( 'dashboard.jsx', { title: 'AI Aide', browserOnly: true, } );
  });

  app.get('/dashboard', (req, res) => {
    return res.render( 'dashboard.jsx', { title: 'AI Aide', browserOnly: true, } );
  });

  app.get('/client/info', addon.checkValidToken(), async (req, res) => {
    const product_id = req.context.addonKey;
    const client_id = req.context.clientKey;

    const response = await fetch(
      `${CLIENT_INFO_API_URL}?client_id=${client_id}&product_id=${product_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: ASK_API_AUTH_TOKEN,
        },
      }
    );
    return response.body.pipe(res);
  });

  app.get('/v2/client/info', addon.checkValidToken(), async (req, res) => {
    const product_id = req.context.addonKey;
    const client_id = req.context.clientKey;

    if (!client_id || !product_id) {
        return res.status(400).json({ error: 'client_id and product_id must be provided' });
    }

    try {
        const client = await findOrCreateClient(client_id, product_id);
        if (!client) {
            return res.status(404).json({ error: 'client not found' });
        }

        const quotaUsed = client.max_quota - client.token_quota;

        res.status(client.metadata.created ? 201 : 200).json({
            client_id: client.client_id,
            quota_used: quotaUsed,
            max_quota: client.max_quota
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/conversations', addon.checkValidToken(), async (req, res) => {
      const { messages } = req.body;

      if (!messages) {
        res.status(422).end();
        return;
      }

      // TODO: improve the logic to pick value.
      const question = messages[0].content.parts[0];

      const data = {
        question: question,
        product_id: req.context.addonKey, // e.g. 'gptdock-confluence'
        user_id: req.context.userAccountId, // e.g. '557058:3731f189-7e58-46c0-b5c7-697c5a021aee'
        client_id: req.context.clientKey, // e.g. 'aa4a743a-201f-38c4-b7fd-d7f8f68ec685'
        license: req.context.license, // could be undefined in local dev env
        stream: true,
      };
      console.log(`Calling ${ASK_API_URL} with`, data);
      const response = await fetch(ASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: ASK_API_AUTH_TOKEN,
        },
        body: JSON.stringify(data),
      });

      return response.body.pipe(res);
    }
  );

  app.post('/image-to-dsl', addon.checkValidToken(), async (req, res) => {
      const { imageUrl } = req.body;
      const userId = req.context.userAccountId;
      const clientId = req.context.clientKey;
      const productId = req.context.addonKey;

      console.log('Request to /image-to-dsl', imageUrl, userId, clientId, productId);

      if (!imageUrl) {
        res.status(422).end();
        return;
      }

      if (await clientRunOutOfToken(clientId, productId)) {
        return res.status(402).json({ error: 'Not enough tokens' });
      }

      // TODO: calculate the image URL token size and deduct from the user's quota.
      // const tokensNeeded = await calculateTokensUsed(imageUrl);
      // if (tokensNeeded > client.token_quota) {
      //   return res.status(402).json({ error: 'Not enough tokens' });
      // }

      const payload = {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [ {type: 'text', text: USER_PROMPT}, {type: 'image_url', image_url: imageUrl} ],
          },
        ],
        // TODO 
        // max_tokens is too large: 30000. This model supports at most 4096 completion tokens, whereas you provided 30000.
        max_tokens: 4096,
      };

      console.log('OpenAI request:', JSON.stringify(payload));

      const response = await fetch(`${OPENAI_BASEURL}/chat/completions`, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": 'Bearer ' + process.env.OPENAI_API_KEY ,
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      console.log(`OpenAI response for ${userId},${clientId},${productId},result:${JSON.stringify(json)}`);

      if(json.error || !json.usage){
        return res.json('Something is wrong: ').end();
      }


      // openai api doc: https://platform.openai.com/docs/api-reference/chat/create
      const tokenUsage = json.usage.total_tokens;
      await deductClientToken(userId, clientId, productId, tokenUsage);

      if (json.choices && json.choices.length > 0) {
        return res.json(json.choices[0].message.content).end();
      } else {
        return res.json('Something is wrong...').end();
      }
    }
  );

  app.post('/save-diagram', addon.checkValidToken(), async (req, res) => {
    const userId = req.context.userAccountId;
    const clientId = req.context.clientKey;
    const productId = req.context.addonKey;
    const { dslCode,contentId,creatorId } = req.body;
    console.log("request to save diagram", dslCode, userId, clientId, productId);

    if (!dslCode) {
      res.status(400).end();
      return;
    }

    const result = DiagramSvc.findOrCreateDiagram(clientId, productId, dslCode, contentId, creatorId)
    res.status(200).send('');

  });

  // Add additional route handlers here...
  app.get('/ai-aide', addon.authenticate(), function (req, res) {
    //  Get the ACE HTTP Client which interfaces with our Confluence instance.
    var httpClient = addon.httpClient(req);
    var contentId = req.query['contentId'];

    //  Using the client, check if the page we are currently viewing has a
    //  content property with a key of 'approvals'.
    //  We use the /rest/api/content/{contentId}/property/{key} endpoint here.
    httpClient.get(
      {
        url: '/rest/api/content/ ' + contentId + '/property/ai-aide',
      },
      function (err, responseApproval, approvalObj) {
        approvalObj = JSON.parse(approvalObj);

        //  Setup all the parameters we need to pass through to our client.
        var propertyExists = approvalObj.statusCode !== 404;
        var allApprovals = propertyExists ? approvalObj.value.approvedBy : [];
        // var version = (propertyExists ? approvalObj.version.number : null);

        //  Render.
        return res.render('ai-aide', {
          numberApprovedBy: allApprovals.length,
          allApprovals: JSON.stringify(allApprovals),
        });
      }
    );
  });

  {
    var fs = require('fs');
    var path = require('path');
    var files = fs.readdirSync("routes");
    for(var index in files) {
        var file = files[index];
        if (file === "index.js") continue;
        // skip non-javascript files
        if (path.extname(file) != ".js") continue;

        var routes = require("./" + path.basename(file));

        if (typeof routes === "function") {
            routes(app, addon);
        }
    }
  }
}
