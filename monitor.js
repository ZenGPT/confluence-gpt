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
    
    app.post('/installed', (req, res, next) => {
        ingest_installed(req.body);
        next();
    });

    app.post('/uninstalled', (req, res, next) => {
        ingest_uninstalled(req.body);
        next();
    });

    app.get('/v2/client/info', (req, res, next) => {
        ingest_client_info(req.context);
        next();
    });

    app.post('/conversations', (req, res, next) => {
        ingest_conversations(req.context);
        next();
    });
}

function ingest_client_info(context) {
    if(!monitorEnable)return;
    let c=context;
    ingestEvent({
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

function ingest_conversations(context) {
    if(!monitorEnable)return;
    let c=context;
    ingestEvent({
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

function ingest_installed(body) {
    if(!monitorEnable)return;
    let c=body;
    ingestEvent({
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

function ingest_uninstalled(body) {
    if(!monitorEnable)return;
    let c=body;
    ingestEvent({
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

function ingestEvent(event){
    try {
        fetch(axiomIngestApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-ndjson', 'Authorization': 'Bearer '+axiomApiToken },
            body: JSON.stringify(event)
        });
    } catch (error) {
        console.log(error);
    }
}
