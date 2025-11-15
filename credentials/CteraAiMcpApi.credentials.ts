import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CteraAiMcpApi implements ICredentialType {
	name = 'cteraAiMcpApi';
	displayName = 'CTERA AI MCP API';
	documentationUrl = 'https://cteranet.atlassian.net/wiki/spaces/AI/pages/4757454995';
	properties: INodeProperties[] = [
		{
			displayName: 'MCP Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://mcp.your-domain.com',
			description: 'The base URL of your CTERA AI MCP server (e.g., https://mcp.example.com)',
		},
		{
			displayName: 'Bearer Token',
			name: 'bearerToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Bearer token for authentication. Generate using: curl -k "https://<your-instance>/api/tokens/generate?oid=<your-oid>&email=<your-email>"',
		},
		{
			displayName: 'Ignore SSL Issues',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			default: true,
			description: 'Whether to connect even if SSL certificate validation is not possible',
		},
	];

	// Note: Test is not included here since each node provides its own expert endpoint URL
	// The node will test the connection when executing
}
