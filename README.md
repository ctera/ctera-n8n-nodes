# n8n-nodes-ctera-ai

n8n community node for CTERA AI MCP integration - enables semantic search, chat, and expert discovery.

[n8n](https://n8n.io/) is a workflow automation platform.

## Installation

```bash
cd ~/.n8n/nodes
npm install @ctera/n8n-nodes-ctera-ai
```

Then restart n8n. The **CTERA Data Intelligence** node will appear in your node list.

## Operations

- **List Experts** - Get all available AI experts (knowledge bases)
- **Semantic Search** - Search within an expert's knowledge base
- **Chat** - Have a conversation with an AI expert

## Credentials

**1. Generate a Bearer Token:**

```bash
curl -k "https://YOUR_MCP_SERVER/api/tokens/generate?oid=YOUR_OID&email=YOUR_EMAIL" | jq -r .token
```

Find your OID in the Admin UI under your user profile, or decode it from your JWT token.

**2. Configure in n8n:**

- **MCP Server URL**: `https://mcp.your-domain.com`
- **Bearer Token**: Paste the token from step 1
- **Ignore SSL Issues**: Enable for self-signed certificates

## Example Use Cases

- **Daily Intelligence Reports** - Schedule searches across experts for recent updates
- **Q&A Chatbots** - Build webhook-based chatbots using the Chat operation
- **Document Discovery** - Monitor for new content and send notifications

## Resources

- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [CTERA AI MCP Architecture](https://cteranet.atlassian.net/wiki/spaces/AI/pages/4757454995)
- [GitHub Issues](https://github.com/ctera/ctera-n8n-nodes/issues)

## License

[MIT](LICENSE) - See [PUBLISH.md](PUBLISH.md) for publishing guidelines.


