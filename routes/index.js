import fetch from 'node-fetch';

const ASK_API_URL = 'http://localhost:5001/v1/ask';
const ASK_API_AUTH_TOKEN = 'Bearer localhost';
const CLIENT_INFO_API_URL = 'http://localhost:5001/v1/client/info';
const OPENAI_BASEURL='https://gateway.ai.cloudflare.com/v1/8d5fc7ce04adc5096f52485cce7d7b3d/diagramly-ai/openai';
const SYSTEM_PROMPT = `You're an experienced software architect and familiar with UML.`;
const USER_PROMPT = `ZenUML Translator specializes in analyzing error stack traces for method call relationships and translating them into ZenUML DSL without explicit participant declarations. It identifies which class methods are calling others and structures this information into ZenUML DSL. For instance, given a stack trace snippet ‘#0 /app/app/Modules/WeiXin/WeiXinService.php(32): SocialiteProviders\Manager\OAuth2\AbstractProvider->user() #1 /app/app/Modules/WeiXin/WeiXinService.php(28): App\Modules\WeiXin\WeiXinService->loginCallbackToRegisterUser()’, it understands that the ‘loginCallbackToRegisterUser’ method of WeiXinService calls the ‘user’ method on OAuth2AbstractProvider. The resulting DSL would be structured as:
WeiXinService.loginCallbackToRegisterUser() {
 OAuth2AbstractProvider.user()
}. This approach streamlines the translation process, making it more efficient and accurate. The translator maintains a friendly and professional demeanor, ensuring DSL outputs are clear and precisely represent the calling hierarchy. For unclear or incomplete stack traces, it seeks clarification.`;

export default function routes(app, addon) {
  // Redirect root path to /atlassian-connect.json,
  // which will be served by atlassian-connect-express.
  app.get('/', (req, res) => {
    res.redirect('/atlassian-connect.json');
  });

  // This is an example route used by "generalPages" module (see atlassian-connect.json).
  // Verify that the incoming request is authenticated with Atlassian Connect.
  app.get('/hello-world', (req, res) => {
    // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
    // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
    res.render(
      'hello-world.jsx', // change this to 'hello-world.jsx' to use the Atlaskit & React version
      {
        title: 'Atlassian Connect',
        //, issueId: req.query['issueId']
        browserOnly: true, // you can set this to disable server-side rendering for react views
      }
    );
  });

  app.get('/client/info', addon.checkValidToken(), async (req, res, next) => {
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
    response.body.pipe(res);
    await next();
  });

  app.post('/conversations', addon.checkValidToken(), async (req, res, next) => {
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

      response.body.pipe(res);
      await next();
    }
  );

  app.post('/image-to-dsl', async (req, res, next) => {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(422).end();
        return;
      }

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
        max_tokens: 300,
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
      console.log("OpenAI response: ", JSON.stringify(json))

      return res.json(json).end();
    }
  );

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
}
