# Diagramly For Confluence

AI-powered diagram generation and content assistance for Confluence Cloud. Built with Atlassian Connect Express.

## Features

- **AI Chat Assistant**: GPTDock provides conversational AI assistance with streaming responses
- **Image-to-Diagram**: Convert diagram images to Mermaid DSL using GPT-4 Vision
- **Multi-turn Conversations**: Context-aware chat with conversation history
- **Token Management**: Client-based quota tracking and usage monitoring

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.sample .env

# Configure required environment variables (see below)

# Build and start
npm run build
npm start
```

## Environment Variables

### Required
```bash
OPENAI_API_KEY=sk-...              # OpenAI API key
```

### Optional (with defaults)
```bash
DATABASE_URL=postgres://...        # PostgreSQL URL (production); default: SQLite
AC_LOCAL_BASE_URL=https://...      # Public URL for local dev (Ngrok/Cloudflare Tunnel)
PORT=3000                          # Server port
NODE_ENV=production                # Environment mode
```

## Database

- **ORM**: Sequelize
- **Production**: PostgreSQL (via `DATABASE_URL`)
- **Development**: SQLite (`./database.sqlite`)
- **Local PostgreSQL**: `make pg` (auto-initializes)

### Tables
- `gpt_dock_client_data`: client_id, product_id, max_quota, token_quota
- `gpt_dock_user_data`: user_id, org_id, token_used

## Production Release

### Automated Deployment (Recommended)

1. **Create and push version tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions workflow** (`.github/workflows/release.yml`) automatically:
   - Builds the application
   - Deploys to production server via SSH
   - Restarts PM2 process with environment variables

### Manual Deployment

```bash
# On production server
git pull origin main
npm install
npm run build
pm2 restart diagramly-ai --update-env
```

## Development

### Prerequisites
- Node.js v20.11.1
- VSCode (recommended)

### Local Setup with Cloudflare Tunnel

1. [Create Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/)
2. Set public hostname:
   ```bash
   export AC_LOCAL_BASE_URL=https://your-tunnel.zenuml.com
   ```
3. Start dev server:
   ```bash
   npm run watch
   ```
4. Install app to your Confluence instance (first time only)

### Local Setup with Ngrok

1. Install [Ngrok VSCode extension](https://ngrok.com/blog-post/integrating-vscode-and-ngrok)
2. Configure API key and start tunnel
3. Start dev server: `npm run watch`

### Confluence Plugin Module

```bash
cd modules/confluence-plugin
yarn start:local
```

## References

- [Atlassian Connect Express (ACE)](https://developer.atlassian.com/cloud/confluence/getting-set-up-with-ace/)
- [ACE Source Code](https://bitbucket.org/atlassian/atlassian-connect-express/src/master/)
- [Sequelize ORM](https://sequelize.org/docs/v6/getting-started/)
- [OpenAI API](https://platform.openai.com/docs/api-reference/chat)
