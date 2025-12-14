# n8n-nodes-ctera-ai

n8n community node for CTERA AI MCP integration - enables semantic search, file search, chat, and expert discovery.

[n8n](https://n8n.io/) is a workflow automation platform.

## Installation

```bash
cd ~/.n8n/nodes
npm install @ctera/n8n-nodes-ctera-ai
```

Then restart n8n. The **CTERA Data Intelligence** node will appear in your node list.

## Operations

- **List Experts** - Get all available AI experts (knowledge bases)
- **Semantic Search** - Search within an expert's knowledge base (returns text chunks for RAG)
- **File Search** - Search files and return metadata with optional snippets (returns file-level results)
- **Chat** - Have a conversation with an AI expert

## File Search Operation

The File Search operation searches files within an expert's knowledge base and returns file-level metadata with optional content snippets.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Query | string | required | Search expression with free-text and optional `key:value` filters |
| Limit | number | 100 | Maximum number of results (max: 250) |
| Offset | number | 0 | Pagination offset |
| Sort By | select | relevance | Sort order: `relevance`, `modified_at`, `created_at`, `name` |
| Include Snippet | boolean | false | Include text snippet per file |
| Include Markdown | boolean | false | Include full markdown body per file |

### Search Expression Syntax

The query parameter supports free-text search combined with metadata filters:

```
# Free-text search
API documentation

# Free-text with classifier filters
API documentation department:Engineering

# Multiple filters
security policy department:Legal urgency:high
```

### Output

Each file hit becomes a separate n8n item with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| fileId | string | Document UUID |
| name | string | File name |
| path | string | File path |
| sizeBytes | number | File size in bytes |
| mimeType | string | MIME content type |
| createdAt | string | ISO timestamp of creation |
| modifiedAt | string | ISO timestamp of last modification |
| storageSystem | string | Storage system identifier |
| bucketOrShare | string | Bucket or share name |
| score | number | Relevance score (0-1) |
| standardMetadata | object | Standard file metadata (guid, dataset_id, permissions) |
| customMetadata | object | Custom metadata (classifier_tags, classifications) |
| snippet | string | Text snippet (when include_snippet=true) |
| markdownBody | string | Full markdown content (when include_markdown=true) |
| _meta | object | Pagination info (total, limit, offset) |

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
- **File Metadata Analysis** - Use File Search to find files by metadata filters and process each result
- **Compliance Scanning** - Search for files matching specific classifier tags

## Resources

- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [GitHub Issues](https://github.com/ctera/ctera-n8n-nodes/issues)

## License

[MIT](LICENSE) - See [PUBLISH.md](PUBLISH.md) for publishing guidelines.


