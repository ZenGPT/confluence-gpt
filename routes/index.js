const fetch = require('node-fetch');

// TODO: remote the hard-code host
const ASK_API_URL = 'http://localhost:5001/v1/ask';
const ASK_API_AUTH_TOKEN = 'Bearer localhost';
const CLIENT_INFO_API_URL = 'http://localhost:5001/v1/client/info';

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

  app.post(
    '/conversations',
    // Require a valid token to access this resource
    addon.checkValidToken(),
    async (req, res, next) => {
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
