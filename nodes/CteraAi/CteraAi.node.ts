import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class CteraAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CTERA Data Intelligence',
		name: 'cteraAi',
		icon: 'file:ctera.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["tool"]}}',
		description: 'Interact with CTERA Data Intelligence experts via per-expert MCP endpoints',
		defaults: {
			name: 'CTERA Data Intelligence',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cteraAiMcpApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Expert MCP Endpoint URL',
				name: 'expertEndpointUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						operation: ['listExperts'],
					},
				},
				placeholder: 'https://mcp.your-domain.com/mcp/experts/EXPERT_ID',
				description: 'The per-expert MCP endpoint URL. Use "List Experts" operation to get this URL.',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'List Experts',
						value: 'listExperts',
						description: 'Get list of all available experts',
					},
					{
						name: 'Semantic Search (for RAG)',
						value: 'search',
						description: 'Retrieve raw text chunks for Retrieval-Augmented Generation',
					},
					{
						name: 'File Search (Files & Metadata)',
						value: 'fileSearch',
						description: 'Search files and return metadata with optional snippets',
					},
					{
						name: 'Chat (Generative Answer)',
						value: 'chat',
						description: 'Get a direct, generated answer from the expert',
					},
				],
				default: 'search',
				required: true,
				description: 'Choose the operation to perform',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						operation: ['listExperts'],
					},
				},
				placeholder: 'What are the key features of the product?',
				description: 'The natural language question to ask your data',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Modified Date Start',
						name: 'modified_date_start',
						type: 'dateTime',
						default: '',
						description: 'Filter results from files modified on or after this date',
					},
					{
						displayName: 'Modified Date End',
						name: 'modified_date_end',
						type: 'dateTime',
						default: '',
						description: 'Filter results from files modified up to this date',
					},
					{
						displayName: 'Number of Results (k)',
						name: 'k',
						type: 'number',
						default: 5,
						description: 'Number of text chunks to fetch (top-k)',
						typeOptions: {
							minValue: 1,
							maxValue: 50,
						},
					},
					{
						displayName: 'Window Size',
						name: 'window_size',
						type: 'number',
						default: 2,
						description: 'Context window size around matches (in KB)',
						typeOptions: {
							minValue: 1,
							maxValue: 10,
						},
					},
				],
			},
			{
				displayName: 'File Search Options',
				name: 'fileSearchOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['fileSearch'],
					},
				},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 100,
						description: 'Maximum number of results to return',
						typeOptions: {
							minValue: 1,
							maxValue: 250,
						},
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Pagination offset',
						typeOptions: {
							minValue: 0,
						},
					},
					{
						displayName: 'Sort By',
						name: 'sort_by',
						type: 'options',
						options: [
							{
								name: 'Relevance',
								value: 'relevance',
							},
							{
								name: 'Modified Date',
								value: 'modified_at',
							},
							{
								name: 'Created Date',
								value: 'created_at',
							},
							{
								name: 'Name',
								value: 'name',
							},
						],
						default: 'relevance',
						description: 'Sort order for results',
					},
					{
						displayName: 'Include Snippet',
						name: 'include_snippet',
						type: 'boolean',
						default: false,
						description: 'Whether to return text snippet per file',
					},
					{
						displayName: 'Include Markdown',
						name: 'include_markdown',
						type: 'boolean',
						default: false,
						description: 'Whether to return full markdown body per file',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

			const credentials = await this.getCredentials('cteraAiMcpApi');
			const bearerToken = credentials.bearerToken as string;
			const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts as boolean;
			const mcpServerUrl = (credentials.serverUrl as string).replace(/\/$/, ''); // Remove trailing slash

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let toolName: string;
				let serverUrl: string;
				const params: any = {};

				// Determine tool name, server URL, and parameters based on operation
				if (operation === 'listExperts') {
					toolName = 'ctera_list_experts';
					serverUrl = `${mcpServerUrl}/mcp-bearer`;
				} else if (operation === 'search') {
					toolName = 'expert_semantic_search';
					serverUrl = this.getNodeParameter('expertEndpointUrl', i) as string;
					const query = this.getNodeParameter('query', i) as string;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

					params.query = query;

					if (additionalOptions.modified_date_start) {
						params.modified_date_start = new Date(additionalOptions.modified_date_start).toISOString();
					}
					if (additionalOptions.modified_date_end) {
						params.modified_date_end = new Date(additionalOptions.modified_date_end).toISOString();
					}
					if (additionalOptions.k) {
						params.k = additionalOptions.k;
					}
					if (additionalOptions.window_size) {
						params.window_size = additionalOptions.window_size;
					}
				} else if (operation === 'fileSearch') {
					toolName = 'expert_file_search';
					serverUrl = this.getNodeParameter('expertEndpointUrl', i) as string;
					const query = this.getNodeParameter('query', i) as string;
					const fileSearchOptions = this.getNodeParameter('fileSearchOptions', i, {}) as any;

					params.query = query;

					if (fileSearchOptions.limit !== undefined) {
						params.limit = fileSearchOptions.limit;
					}
					if (fileSearchOptions.offset !== undefined) {
						params.offset = fileSearchOptions.offset;
					}
					if (fileSearchOptions.sort_by) {
						params.sort_by = fileSearchOptions.sort_by;
					}
					if (fileSearchOptions.include_snippet !== undefined) {
						params.include_snippet = fileSearchOptions.include_snippet;
					}
					if (fileSearchOptions.include_markdown !== undefined) {
						params.include_markdown = fileSearchOptions.include_markdown;
					}
				} else if (operation === 'chat') {
					toolName = 'expert_chat';
					serverUrl = this.getNodeParameter('expertEndpointUrl', i) as string;
					const query = this.getNodeParameter('query', i) as string;

					params.message = query;
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex: i,
					});
				}

				// Construct the JSON-RPC payload
				const requestBody = {
					jsonrpc: '2.0',
					method: 'tools/call',
					params: {
						name: toolName,
						arguments: params,
					},
					id: i + 1,
				};

			// Make the HTTP request
			const response = await this.helpers.httpRequest({
				method: 'POST',
				url: serverUrl,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${bearerToken}`,
				},
				body: JSON.stringify(requestBody),
				skipSslCertificateValidation: allowUnauthorizedCerts,
			});

			// Parse JSON response
			const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

			// Handle MCP error responses
			if (parsedResponse.error) {
				throw new NodeOperationError(
					this.getNode(),
					`MCP Error: ${parsedResponse.error.message || JSON.stringify(parsedResponse.error)}`,
					{ itemIndex: i },
				);
			}

			// Parse the result from MCP response
			let result: any;
			if (parsedResponse.result && parsedResponse.result.content) {
				// MCP returns content array
				const content = parsedResponse.result.content[0];
				if (content && content.type === 'text') {
					try {
						// Try to parse as JSON if it looks like JSON
						result = JSON.parse(content.text);
					} catch {
						// If not JSON, return as text
						result = content.text;
					}
				} else {
					result = content;
				}
			} else {
				result = parsedResponse.result;
			}

				// Handle fileSearch with fan-out pattern - each hit becomes a separate item
				if (operation === 'fileSearch' && result && result.hits && Array.isArray(result.hits)) {
					// Map snake_case to camelCase for n8n conventions
					for (const hit of result.hits) {
						returnData.push({
							json: {
								...items[i].json,
								operation,
								toolName,
								// Map to camelCase field names
								fileId: hit.id,
								name: hit.name,
								path: hit.path,
								sizeBytes: hit.size_bytes,
								mimeType: hit.mime_type,
								createdAt: hit.created_at,
								modifiedAt: hit.modified_at,
								storageSystem: hit.storage_system,
								bucketOrShare: hit.bucket_or_share,
								score: hit.score,
								standardMetadata: hit.standard_metadata,
								customMetadata: hit.custom_metadata,
								snippet: hit.snippet,
								markdownBody: hit.markdown_body,
								// Include pagination info from response
								_meta: {
									total: result.total,
									limit: result.limit,
									offset: result.offset,
								},
							},
							pairedItem: { item: i },
						});
					}
					// If no hits, still return an item indicating empty results
					if (result.hits.length === 0) {
						returnData.push({
							json: {
								...items[i].json,
								operation,
								toolName,
								result: [],
								_meta: {
									total: result.total || 0,
									limit: result.limit || 0,
									offset: result.offset || 0,
								},
							},
							pairedItem: { item: i },
						});
					}
				} else {
					returnData.push({
						json: {
							...items[i].json,
							operation,
							toolName,
							result,
						},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							...items[i].json,
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
