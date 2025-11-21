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

**1. Log into Admin UI** with your SSO credentials

**2. Generate MCP Bearer Token:**

Navigate to the MCP Tokens section in Admin UI, or use the API:

```bash
curl -k -X POST "https://YOUR_ADMIN_URL/admin/api/mcp-tokens/generate" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"days": 30}' | jq -r .token
```

**3. Configure in n8n:**

- **MCP Server URL**: `https://mcp.your-domain.com`
- **Bearer Token**: Paste the token from step 2
- **Ignore SSL Issues**: Enable for self-signed certificates

## Example Use Cases

- **Daily Intelligence Reports** - Schedule searches across experts for recent updates
- **Q&A Chatbots** - Build webhook-based chatbots using the Chat operation
- **Document Discovery** - Monitor for new content and send notifications

## Resources

- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [GitHub Issues](https://github.com/ctera/ctera-n8n-nodes/issues)

## License

[MIT](LICENSE) - See [PUBLISH.md](PUBLISH.md) for publishing guidelines.


