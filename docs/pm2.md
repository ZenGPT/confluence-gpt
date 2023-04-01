# Auto start after rebooting

To make sure the server is always running, we need to set up auto start after rebooting.

1. Start the server
2. Run `sudo pm2 startup` to generate the startup script (sudo is required)
3. Run `sudo pm2 save` to save the current process list

```shell
sudo LOCAL_BASE_URL='https://ace.gptdock.com' DATABASE_URL='postgres://admin:p@ssw0rd@localhost:5432/gptdock' PORT=80 NODE_ENV=production pm2 start app.js --node-args="-r esm"
sudo pm2 startup
sudo pm2 save
```

# Change the command line (e.g. update ENV variables)

```shell
sudo pm2 delete app
sudo LOCAL_BASE_URL='https://ace.gptdock.com' DATABASE_URL='postgres://admin:p@ssw0rd@localhost:5432/gptdock' PORT=80 NODE_ENV=production pm2 start app.js --node-args="-r esm"
sudo pm2 save
```
