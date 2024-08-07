Installing GPT for Confluence:

- Log into your Confluence instance as **administrator**.
- Click the **Apps** dropdown and choose **Find new apps**. The _Find new apps_ screen loads.
- Search for **GPT for Confluence** and click on the app tile.The _App Details_ screen loads.
- Click **Try it free** to start installing your app.
- You're all set!Click **Close** in the _Installed and ready to go_ dialog.

Using GPT for Confluence as a user:

- Step 1: Once the installation is complete, go to the Confluence page where you want to generate text.
- Step 2: Click on the "Aide" link at the top of your article (byline).
- Step 3: A dialog box will appear, prompting you to enter some details about the text you want to generate.
- Step 4: Enter the necessary details, such as the type of content you want to generate, the language, and any other relevant information.
- Step 5: Click "Generate", and the text will appear on the page.
- Step 6: Review the generated text and make any necessary edits or adjustments.
- Step 7: Copy the text as needed as use it anywhere in Confluence.

Tips for using GPT for Confluence:

- Keep your requests as specific as possible to get the most accurate results.
- Don't rely solely on generated text - always review and edit to ensure it meets your needs.
- Experiment with different types of content and formats to fully take advantage of the tool's flexibility.

Develop:
-   VSCode (recommended)
-   node v16.\*
-   Set up Ngrok: use [VSCode extendsion](https://ngrok.com/blog-post/integrating-vscode-and-ngrok) or ngrok command to setup your own API key
-   Crends **Credentials.json** based on **Credentials.json.sample**. [api-token Reference](https://id.atlassian.com/manage-profile/security/api-tokens)
- Start pg db: `make pg`. It'll init db automantically.
- Set local environment:
  ```
  export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5438/gpt_ace
  export LOCAL_BASE_URL=https://{your custom domain}
  export PORT=3000
  export NODE_ENV=production
  export OPENAI_API_KEY=....
  export CF_R2_ACCESS_KEY=....
  export CF_R2_SECRET_KEY=....
  ```
- copy .env.sample to .env
-   > npm install
-   > npm run build
-   > npm run start
- install your own app into your Confluence instance at the first time of setting up the local env.


## Set up local development environment using Cloudflare Tunnel

With `ngrok` based [local environment setup](https://bitbucket.org/atlassian/atlassian-connect-express/src/master/), one known issue is `Failed to start ngrok tunnel` on hot reloads. To address this, one alternative is Cloudflare Tunnel.

* Follow [this guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/) to set up the tunnel
* Set up local environment variable for ACE local base url using your public hostname

  e.g.
  ```bash
  export AC_LOCAL_BASE_URL=https://yanhui3000.zenuml.com
  ```
* After that, start local server with `npm run watch`
* Verify the atlassian descriptor at your public hostname, and ensure the `baseUrl` is correct

## Local development of confluence-plugin module

```
cd modules/confluence-plugin
yarn start:local
```

## Reference
* Getting set up with Atlassian Connect Express (ACE)
: https://developer.atlassian.com/cloud/confluence/getting-set-up-with-ace/
* atlassian-connect-express source code: https://bitbucket.org/atlassian/atlassian-connect-express/src/master/

## DB ORM

* Sequelize: https://sequelize.org/docs/v6/getting-started/
* Tables:
  * gpt_dock_client_data
    * client_id
    * product_id
    * max_quota
    * token_quota
  * gpt_dock_user_data
    * user_id
    * org_id
    * token_used