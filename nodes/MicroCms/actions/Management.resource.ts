import { INodeProperties } from 'n8n-workflow';

export const managementResource: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['management'],
			},
		},
		options: [
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Change content status to PUBLISH or DRAFT',
				action: 'Update content status',
			},
			{
				name: 'Upload Media',
				value: 'uploadMedia',
				description: 'Upload media file to microCMS',
				action: 'Upload media',
			},
		],
		default: 'updateStatus',
	},
	// --- Fields for 'Update Status' operation ---
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['management'],
				operation: ['updateStatus'],
			},
		},
		description: 'The API endpoint name (e.g., blogs, news)',
		placeholder: 'blogs',
	},
	{
		displayName: 'Content ID',
		name: 'contentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['management'],
				operation: ['updateStatus'],
			},
		},
		description: 'The ID of the content to update',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['management'],
				operation: ['updateStatus'],
			},
		},
		options: [
			{
				name: 'Publish',
				value: 'PUBLISH',
				description: 'Set content status to published',
			},
			{
				name: 'Draft',
				value: 'DRAFT',
				description: 'Set content status to draft',
			},
		],
		default: 'PUBLISH',
		description: 'The status to set for the content',
	},
	// --- Fields for 'Upload Media' operation ---
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['management'],
				operation: ['uploadMedia'],
			},
		},
		description: 'The name of the binary property that contains the file to upload',
		hint: 'The name of the input field containing the binary file data',
	},
];