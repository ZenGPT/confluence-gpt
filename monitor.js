import fetch from 'node-fetch';
import config from './monitor.json';
let env=null;
let monitorEnable=null;
let axiomApiToken=null;
let axiomIngestApiUrl=null;
let platform=null;

export default function monitor(app) {
    const monitorConfig=config[app.get("env")].monitor;
    env=monitorConfig.env;
    monitorEnable=monitorConfig.enable;
    let axiomApiTokenName=monitorConfig.axiomApiToken.replace("$","");
    axiomApiToken=process.env[axiomApiTokenName];
    axiomIngestApiUrl=monitorConfig.axiomIngestApiUrl;
    platform=monitorConfig.platform;
    
    app.post('/installed', async (req, res, next) => {
        await ingest_installed(req.body);
        await next();
    });

    app.post('/uninstalled', async (req, res, next) => {
        await ingest_uninstalled(req.body);
        await next();
    });

    app.get('/client/info', async (req, res, next) => {
        await ingest_client_info(req.context);
        await next();
    });

    app.post('/conversations', async (req, res, next) => {
        await ingest_conversations(req.context);
        await next();
    });
}

async function ingest_client_info(context) {
    if(!monitorEnable)return;
    let c=context;
    await ingestEvent({
        "event_type": "client_info", 
        "worker_id": process.pid,
        "environment":env,
        "platform":platform,
        "client_id":c.clientKey,
        "product_id":c.addonKey,
        "license":c.license,
        "host_base_url":c.hostBaseUrl,
        "user_id":c.userAccountId,
        "loacal_base_url":c.localBaseUrl
       });
}

async function ingest_conversations(context) {
    if(!monitorEnable)return;
    let c=context;
    await ingestEvent({
        "event_type": "conversations", 
        "worker_id": process.pid,
        "environment":env,
        "platform":platform,
        "client_id":c.clientKey,
        "product_id":c.addonKey,
        "license":c.license,
        "host_base_url":c.hostBaseUrl,
        "user_id":c.userAccountId,
        "local_base_url":c.localBaseUrl
       });
}

async function ingest_installed(body) {
    if(!monitorEnable)return;
    let c=body;
    await ingestEvent({
        "event_type": "installed", 
        "worker_id": process.pid,
        "environment":env,
        "platform":platform,
        "client_id":c.clientKey,
        "product_id":c.key,
        "product_type":c.productType,
        "plugins_version":c.pluginsVersion,
        "server_version":c.serverVersion,
        "host_base_url":c.baseUrl,
       });
}

async function ingest_uninstalled(body) {
    if(!monitorEnable)return;
    let c=body;
    await ingestEvent({
        "event_type": "uninstalled", 
        "body": body,
        "worker_id": process.pid,
        "environment":env,
        "platform":platform,
        "client_id":c.clientKey,
        "product_id":c.key,
        "product_type":c.productType,
        "plugins_version":c.pluginsVersion,
        "server_version":c.serverVersion,
        "host_base_url":c.baseUrl,
       });
}

async function ingestEvent(event){
    try {
        await fetch(axiomIngestApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-ndjson', 'Authorization': 'Bearer '+axiomApiToken },
            body: JSON.stringify(event)
        });
    } catch (error) {
        console.log(error);
    }
}
