# Database

## Tunnel staging database to local

```bash
cloudflared access tcp -T stag-tunnel.diagramly.ai -L 127.0.0.1:5432
```

After running the above command, you can connect to the staging database using the following command:

```bash
psql -h localhost -p 5432 -U stag_ace_post -d gpt_ace_stag
```

You can get the password from the Slack Cavans.
