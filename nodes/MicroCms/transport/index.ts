import type { IExecuteFunctions, IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { randomBytes } from 'node:crypto';

/**
 * microCMS のサービスドメインは英小文字・数字・ハイフンだけ。
 * ここを検査しないと "evil.example.com/x?" のような値で API キーを
 * microCMS 以外のホストへ送ってしまう（URL を文字列連結しているため）。
 */
export function assertServiceDomain(serviceDomain: unknown): string {
	const value = String(serviceDomain ?? '').trim();
	if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(value)) {
		throw new Error(
			`Invalid microCMS Service Domain "${value}". Use only the subdomain part (e.g. "your-service" for https://your-service.microcms.io).`,
		);
	}
	return value;
}

/** エンドポイント名・コンテンツ ID をパスに入れる前にエンコードする（"/" や "?" を含む値で別の API を叩かない）。 */
export function contentPath(...segments: string[]): string {
	return segments.map((s) => '/' + encodeURIComponent(String(s).trim())).join('');
}

/**
 * multipart/form-data の本文を組み立てる。
 * n8n の httpRequest（axios）は `{ value, options }` 形式（旧 request ライブラリの formData）を
 * 解釈せず JSON にしてしまうので、Buffer にして Content-Type を明示する。
 */
export function buildMultipartBody(
	fieldName: string,
	data: Buffer,
	filename: string,
	contentType: string,
	boundary = '----n8nMicroCms' + randomBytes(12).toString('hex'),
): { body: Buffer; contentType: string } {
	const safeName = filename.replace(/["\r\n]/g, '_');
	const head = Buffer.from(
		`--${boundary}\r\n` +
			`Content-Disposition: form-data; name="${fieldName}"; filename="${safeName}"\r\n` +
			`Content-Type: ${contentType}\r\n\r\n`,
	);
	const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
	return {
		body: Buffer.concat([head, data, tail]),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

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
	const serviceDomain = assertServiceDomain(credentials.serviceDomain);

	const options: IHttpRequestOptions = {
		method,
		headers: {
			'X-MICROCMS-API-KEY': credentials.apiKey as string,
			'Content-Type': 'application/json',
		},
		url: `https://${serviceDomain}.microcms.io/api/v1${endpoint}`,
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
	const serviceDomain = assertServiceDomain(credentials.serviceDomain);

	const options: IHttpRequestOptions = {
		method,
		headers: {
			'X-MICROCMS-API-KEY': credentials.managementApiKey as string,
			'Content-Type': 'application/json',
		},
		url: `https://${serviceDomain}.microcms-management.io/api/v1${endpoint}`,
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
	const serviceDomain = assertServiceDomain(credentials.serviceDomain);

	const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	const multipart = buildMultipartBody(
		'file',
		dataBuffer,
		binaryData.fileName ?? 'file',
		binaryData.mimeType ?? 'application/octet-stream',
	);

	const options: IHttpRequestOptions = {
		method: 'POST',
		headers: {
			// Management API のキーで送る。httpRequestWithAuthentication を使うと
			// 資格情報の authenticate（Content API のキー）でこのヘッダーが上書きされる。
			'X-MICROCMS-API-KEY': credentials.managementApiKey as string,
			'Content-Type': multipart.contentType,
		},
		url: `https://${serviceDomain}.microcms-management.io/api/v1/media`,
		body: multipart.body,
		json: true,
	};

	try {
		const responseData = await this.helpers.httpRequest(options);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}