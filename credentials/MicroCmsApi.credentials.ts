import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MicroCmsApi implements ICredentialType {
	name = 'microCmsApi';
	displayName = 'microCMS API';
	documentationUrl = 'https://document.microcms.io/content-api/get-list-contents';
	properties: INodeProperties[] = [
		{
			displayName: 'Service Domain',
			name: 'serviceDomain',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'your-service',
			description: 'The service domain of your microCMS instance (e.g., "your-service" from https://your-service.microcms.io)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for accessing your microCMS API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-MICROCMS-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};
}