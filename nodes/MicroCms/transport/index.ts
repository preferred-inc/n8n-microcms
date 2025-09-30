import type { IExecuteFunctions, IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

/**
 * Make an API request to microCMS Content API
 */
export async function microCmsApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: any,
	qs?: any,
): Promise<any> {
	const credentials = await this.getCredentials('microCmsApi');

	if (!credentials.serviceDomain || !credentials.apiKey) {
		throw new Error('microCMS credentials are not properly configured');
	}

	const options: IHttpRequestOptions = {
		method,
		headers: {
			'X-MICROCMS-API-KEY': credentials.apiKey as string,
			'Content-Type': 'application/json',
		},
		url: `https://${credentials.serviceDomain}.microcms.io/api/v1${endpoint}`,
		json: true,
	};

	if (body) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	try {
		const responseData = await this.helpers.httpRequest(options);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}

/**
 * Make an API request to microCMS Management API
 */
export async function microCmsManagementApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: any,
	qs?: any,
): Promise<any> {
	const credentials = await this.getCredentials('microCmsApi');

	if (!credentials.serviceDomain) {
		throw new NodeOperationError(
			this.getNode(),
			'microCMS Service Domain is not configured',
		);
	}

	if (!credentials.managementApiKey) {
		throw new NodeOperationError(
			this.getNode(),
			'Management API Key is required for this operation. Please add it to your credentials.',
		);
	}

	const options: IHttpRequestOptions = {
		method,
		headers: {
			'X-MICROCMS-API-KEY': credentials.managementApiKey as string,
			'Content-Type': 'application/json',
		},
		url: `https://${credentials.serviceDomain}.microcms-management.io/api/v1${endpoint}`,
		json: true,
	};

	if (body) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	try {
		const responseData = await this.helpers.httpRequest(options);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}

/**
 * Upload media file to microCMS Management API
 */
export async function microCmsUploadMedia(
	this: IExecuteFunctions,
	binaryPropertyName: string,
	itemIndex: number,
): Promise<any> {
	const credentials = await this.getCredentials('microCmsApi');

	if (!credentials.serviceDomain) {
		throw new NodeOperationError(
			this.getNode(),
			'microCMS Service Domain is not configured',
		);
	}

	if (!credentials.managementApiKey) {
		throw new NodeOperationError(
			this.getNode(),
			'Management API Key is required for media upload. Please add it to your credentials.',
		);
	}

	const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	const options: IHttpRequestOptions = {
		method: 'POST',
		headers: {
			'X-MICROCMS-API-KEY': credentials.managementApiKey as string,
		},
		url: `https://${credentials.serviceDomain}.microcms-management.io/api/v1/media`,
		body: {
			file: {
				value: dataBuffer,
				options: {
					filename: binaryData.fileName,
					contentType: binaryData.mimeType,
				},
			},
		},
		json: true,
	};

	try {
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'microCmsApi',
			options,
		);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}