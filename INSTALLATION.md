# n8n Node Installation Guide

## Prerequisites
- n8n installed locally
- Node.js 18+ and npm
- Access to CTERA AI MCP server (e.g., https://mcp.your-domain.com)
- At least one **public** expert configured in admin UI

## Installation Steps

### 1. Build the Node
```bash
cd /home/omria/data-intelligence/ctera-ai-devops/n8n-nodes-ctera-ai
npm install
npm run build
```

### 2. Link to n8n
```bash
# Create link
npm link

# Link to n8n
cd ~/.n8n/nodes
npm link n8n-nodes-ctera-ai
```

### 3. Start n8n
```bash
n8n start
```

The node will appear as "CTERA Data Intelligence" in n8n's node menu.

## Configuration

### Understanding Token Authentication

**How to generate a token (Development/Testing):**

To generate a token with your real user identity, you need your **Entra ID Object ID (OID)**:

```bash
# Get your OID from Azure portal or from an existing session
# Example: a1b2c3d4-5678-90ab-cdef-1234567890ab

# Generate token with your OID (replace YOUR_MCP_SERVER with your actual domain)
curl -k "https://YOUR_MCP_SERVER/api/tokens/generate?oid=YOUR_OID_HERE&email=your.email@ctera.com" | jq

# Example:
curl -k "https://mcp.example.com/api/tokens/generate?oid=a1b2c3d4-5678-90ab-cdef-1234567890ab&email=user@example.com" | jq
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_oid": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "email": "john@ctera.com",
  "expires_in_days": 30
}
```

**Access Control:**
- The token contains **your real user identity** (OID from Entra ID)
- You can access:
  - **Public experts** (marked `public: true` in MongoDB)
  - **Your own experts** (where you are the owner)
  - **Shared experts** (where you're in the `shared_with` list)

**Token validity:**
- Default: 30 days (can specify with `&days=60`, max 90)
- Only regenerate when:
  - It expires
  - You need to test with a different user

**⚠️ Production Token Generation:**
The `GET /api/tokens/generate` endpoint is for **CLI/automation use** where OAuth browser authentication is not feasible.

For browser-based token management, users can:
- Generate tokens via **Admin UI** (logged in with Entra ID)
- View all their tokens with metadata
- Revoke tokens as needed

### Make an Expert Public

**Option 1: Via Admin UI**
1. Open admin UI: `http://your-domain.com/admin`
2. Navigate to Experts
3. Find your expert (e.g., "Global Expert")
4. Set `public: true`
5. Save

**Option 2: Via MongoDB (for testing)**
```bash
# Make all experts public for testing
docker exec -it mongo mongosh ctera-ai-admin --eval \
  'db.experts.updateMany({}, {$set: {public: true}})'
```

**Verify experts are public:**
```bash
# After marking as public, restart retriever to reload
docker compose restart ctera-ai-retriever

# Wait 3 seconds, then test
sleep 3

# Generate token with YOUR OID and email (replace with your actual values)
TOKEN=$(curl -k "https://YOUR_MCP_SERVER/api/tokens/generate?oid=YOUR_OID_HERE&email=your.email@example.com" | jq -r .token)

curl -k https://YOUR_MCP_SERVER/mcp-bearer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ctera_list_experts","arguments":{}},"id":1}' | jq

# Should now return experts with mcp_endpoint URLs
```

### Add Credentials in n8n

1. Open n8n UI: http://localhost:5678
2. Go to **Credentials** (gear icon in sidebar)
3. Click **Add Credential**
4. Search for "CTERA AI MCP API"
5. Fill in:
   - **MCP Server URL**: Enter your server URL (e.g., `https://mcp.example.com`)
   - **Bearer Token**: Paste your generated token
   - **Ignore SSL Issues**: ✓ Check this
6. Click **Save**

## Usage

### List Experts
Returns all **public** experts or experts you have access to.

1. Add **CTERA AI** node to workflow
2. Select **Operation**: "List Experts"
3. Select your credential
4. Execute

Output includes:
- `id`: Expert MongoDB ID (e.g., `69158cf98ad6cbf9167e6df1`)
- `name`: Expert display name
- `description`: Expert description
- `mcp_endpoint`: Per-expert MCP URL to use in subsequent calls

### Semantic Search
Search an expert's knowledge base for relevant document chunks.

1. Add **CTERA AI** node
2. Select **Operation**: "Semantic Search (for RAG)"
3. **Expert MCP Endpoint URL**: Copy `mcp_endpoint` from List Experts output
   - Example: `https://mcp.your-domain.com/mcp/experts/69158cf98ad6cbf9167e6df1`
4. **Query**: Your search question
5. Execute

### Chat
Get a generated answer from an expert.

1. Add **CTERA AI** node
2. Select **Operation**: "Chat (Generative Answer)"
3. **Expert MCP Endpoint URL**: Copy from List Experts output
4. **Query**: Your question
5. Execute

## Making Changes

After modifying node code:

```bash
# Rebuild
npm run build

# Restart n8n (Ctrl+C then)
n8n start
```

The token does **NOT** need to be regenerated after code changes.

## Troubleshooting

### List Experts returns empty `[]`

**Cause:** No public experts or experts accessible to your token's user.

**Solution:**
```bash
# Check which experts exist and their public status
docker logs ctera-ai-retriever 2>&1 | grep "Expert.*public.*owner.*access" | tail -5

# Make an expert public via MongoDB
docker exec -it mongo mongosh ctera-ai-admin --eval \
  'db.experts.updateOne({name: "Global Expert"}, {$set: {public: true}})'

# Restart retriever to reload experts
docker compose restart ctera-ai-retriever
```

### Node not appearing in n8n

**Check:**
```bash
# Verify build
ls dist/nodes/CteraAi/CteraAi.node.js

# Check link
ls -la ~/.n8n/nodes/ | grep ctera
```

### 401 Unauthorized

- Token expired - generate a new one
- Check "Ignore SSL Issues" is enabled in credentials

### 404 Not Found

- Verify MCP endpoint URL is correct
- Ensure expert ID exists (use List Experts first)

### Chat/Search returns errors

- Verify the expert has indexed documents
- Check expert permissions
- Ensure expert ID in URL matches an accessible expert
