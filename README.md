# n8n-nodes-ctera-ai

This is an n8n community node that provides integration with CTERA AI MCP (Model Context Protocol) server for intelligent document search and retrieval.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

### Community Installation (Recommended)

For n8n version 0.187.0 and above, you can install this node directly from npm:

#### Standard Installation

```bash
npm install -g @ctera/n8n-nodes-ctera-ai
```

Then restart your n8n instance.

#### Docker Installation

For Docker-based n8n installations:

```bash
# Install the node inside the running container
docker exec -it <container-name> npm install -g @ctera/n8n-nodes-ctera-ai

# Restart the container
docker restart <container-name>
```

Replace `<container-name>` with your actual container name (e.g., `n8n`, `n8n_n8n_1`).

**Note**: The node will persist across container restarts but will need to be reinstalled if the container is recreated. To make it permanent, consider creating a custom Docker image or using volume mounts.

### Manual Installation (Development)

1. Navigate to your n8n installation:
   ```bash
   cd ~/.n8n/nodes
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/ctera/ctera-n8n-nodes.git
   cd ctera-n8n-nodes
   ```

3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

4. Restart n8n

For more details, see the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Operations

The CTERA AI node supports the following operations:

### List Experts
Get a list of all available experts (AI knowledge bases) in the system.

**No parameters required**

**Output**: Array of expert objects containing:
- `id`: Expert ID for API calls
- `name`: Display name of the expert
- `description`: Brief description of the expert's knowledge domain
- `mcp_endpoint`: Dedicated MCP endpoint URL for this expert

### Semantic Search
Search an expert's knowledge base using advanced semantic search.

**Parameters**:
- **Expert** (required): Select from available experts (dropdown populated via List Experts)
- **Query** (required): Your search question or topic
- **Additional Options**:
  - Modified After: Filter files modified on or after this date (YYYY-MM-DD)
  - Modified Before: Filter files modified before this date (YYYY-MM-DD)
  - Max Results: Number of relevant chunks to return (1-50, default: 5)

**Output**: Array of relevant document chunks with:
- Text content
- Source file paths
- Relevance scores
- Metadata (dates, file types, etc.)

### Chat
Have a conversational interaction with an AI expert about their knowledge domain.

**Parameters**:
- **Expert** (required): Select from available experts
- **Message** (required): Your message or question to the expert
- **Conversation ID** (optional): Continue an existing conversation thread

**Output**: 
- AI expert's response
- Conversation ID (for follow-up messages)
- Citations to source documents (if applicable)

## Credentials

This node requires CTERA AI MCP API credentials:

### Setup Instructions

1. **Generate a Bearer Token**:
   ```bash
   # Replace YOUR_MCP_SERVER, YOUR_OID, and email with your actual values
   curl -k "https://YOUR_MCP_SERVER/api/tokens/generate?oid=YOUR_OID&email=your.email@example.com" | jq -r .token
   ```

2. **Add Credentials in n8n**:
   - Go to **Credentials** → **New Credential**
   - Search for "CTERA AI MCP API"
   - Fill in:
     - **MCP Server URL**: Your MCP server base URL (e.g., `https://mcp.example.com`)
     - **Bearer Token**: Paste the token from step 1
     - **Ignore SSL Issues**: Enable if using self-signed certificates

3. **Test the Credentials**: Click "Test" to verify connection

## Example Workflows

### Competitive Intelligence Daily Report

```
Schedule Trigger (Daily 9 AM)
  ↓
CTERA AI: List Experts
  ↓
Split In Batches
  ↓
CTERA AI: Semantic Search
  - Expert: {{$json.id}}
  - Query: "Recent updates, announcements, and new features"
  - Modified After: {{$today.minus(7, 'days')}}
  ↓
Aggregate Results
  ↓
Send Email: Daily Intelligence Summary
```

### Interactive Q&A Chatbot

```
Webhook (Receive Question)
  ↓
CTERA AI: Chat
  - Expert: (pre-configured expert ID)
  - Message: {{$json.question}}
  - Conversation ID: {{$json.conversationId}}
  ↓
Format Response
  ↓
Return Webhook Response
```

### Document Discovery Workflow

```
Schedule Trigger (Hourly)
  ↓
CTERA AI: Semantic Search
  - Expert: "Product Documentation"
  - Query: "Installation and setup guides"
  - Modified After: {{$today.minus(1, 'hour')}}
  ↓
Filter: If results not empty
  ↓
Send Slack Notification
```

## Compatibility

Tested with:
- n8n version: 1.0.0+
- CTERA AI MCP Server: 1.6.16+

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [CTERA AI MCP Architecture](https://cteranet.atlassian.net/wiki/spaces/AI/pages/4757454995)
* [Model Context Protocol](https://modelcontextprotocol.io/)

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
npm run lintfix
```

### Publishing

For maintainers publishing new versions to npm, see [PUBLISH.md](PUBLISH.md) for detailed instructions.

## Version History

### 0.1.0
- Initial public release
- List Experts operation  
- Semantic Search operation
- Chat with Expert operation
- Bearer token authentication

## License

[MIT](LICENSE)

## Support

For issues and questions:
- GitHub Issues: https://github.com/ctera/ctera-n8n-nodes/issues
- CTERA Support: support@ctera.com






