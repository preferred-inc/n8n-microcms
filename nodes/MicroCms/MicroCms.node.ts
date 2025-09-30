import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { contentResource } from './actions/Content.resource';
import { managementResource } from './actions/Management.resource';
import { microCmsApiRequest, microCmsManagementApiRequest, microCmsUploadMedia } from './transport';

export class MicroCms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'microCMS',
		name: 'microCms',
		icon: 'file:microCms.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the microCMS API',
		defaults: {
			name: 'microCMS',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'microCmsApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.serviceDomain}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Content',
						value: 'content',
					},
					{
						name: 'Management',
						value: 'management',
					},
				],
				default: 'content',
			},
			...contentResource,
			...managementResource,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'content') {
					const endpoint = this.getNodeParameter('endpoint', i) as string;

					if (!endpoint) {
						throw new NodeOperationError(
							this.getNode(),
							'Endpoint is required',
							{ itemIndex: i },
						);
					}

					if (operation === 'get') {
						// Get a single content by ID
						const contentId = this.getNodeParameter('contentId', i) as string;
						const options = this.getNodeParameter('options', i, {}) as any;

						const qs: any = {};
						if (options.draftKey) {
							qs.draftKey = options.draftKey;
						}
						if (options.fields) {
							qs.fields = options.fields;
						}

						const responseData = await microCmsApiRequest.call(
							this,
							'GET',
							`/${endpoint}/${contentId}`,
							undefined,
							qs,
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'getAll') {
						// Get all contents
						const options = this.getNodeParameter('options', i, {}) as any;

						const qs: any = {};
						if (options.limit) {
							qs.limit = options.limit;
						}
						if (options.offset) {
							qs.offset = options.offset;
						}
						if (options.orders) {
							qs.orders = options.orders;
						}
						if (options.q) {
							qs.q = options.q;
						}
						if (options.fields) {
							qs.fields = options.fields;
						}
						if (options.ids) {
							qs.ids = options.ids;
						}
						if (options.filters) {
							qs.filters = options.filters;
						}

						const responseData = await microCmsApiRequest.call(
							this,
							'GET',
							`/${endpoint}`,
							undefined,
							qs,
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'create') {
						// Create a new content
						const body = this.getNodeParameter('body', i) as string;

						let parsedBody: any;
						try {
							parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								'Body must be valid JSON',
								{ itemIndex: i },
							);
						}

						const responseData = await microCmsApiRequest.call(
							this,
							'POST',
							`/${endpoint}`,
							parsedBody,
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'update') {
						// Update a content
						const contentId = this.getNodeParameter('contentId', i) as string;
						const body = this.getNodeParameter('body', i) as string;

						let parsedBody: any;
						try {
							parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								'Body must be valid JSON',
								{ itemIndex: i },
							);
						}

						const responseData = await microCmsApiRequest.call(
							this,
							'PATCH',
							`/${endpoint}/${contentId}`,
							parsedBody,
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'delete') {
						// Delete a content
						const contentId = this.getNodeParameter('contentId', i) as string;

						const responseData = await microCmsApiRequest.call(
							this,
							'DELETE',
							`/${endpoint}/${contentId}`,
						);

						returnData.push({
							json: { success: true, ...responseData },
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'management') {
					if (operation === 'updateStatus') {
						// Update content status
						const endpoint = this.getNodeParameter('endpoint', i) as string;
						const contentId = this.getNodeParameter('contentId', i) as string;
						const status = this.getNodeParameter('status', i) as string;

						if (!endpoint || !contentId) {
							throw new NodeOperationError(
								this.getNode(),
								'Endpoint and Content ID are required',
								{ itemIndex: i },
							);
						}

						const body = {
							status: [status],
						};

						const responseData = await microCmsManagementApiRequest.call(
							this,
							'PATCH',
							`/contents/${endpoint}/${contentId}/status`,
							body,
						);

						returnData.push({
							json: { success: true, status, ...responseData },
							pairedItem: { item: i },
						});
					} else if (operation === 'uploadMedia') {
						// Upload media file
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

						const responseData = await microCmsUploadMedia.call(
							this,
							binaryPropertyName,
							i,
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
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