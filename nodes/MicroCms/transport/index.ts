import type { IExecuteFunctions, IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an API request to microCMS
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