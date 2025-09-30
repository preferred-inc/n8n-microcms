import { INodeProperties } from 'n8n-workflow';

export const contentResource: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['content'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new content',
				action: 'Create a content',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a content',
				action: 'Delete a content',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single content by ID',
				action: 'Get a content',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many contents',
				action: 'Get many contents',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a content',
				action: 'Update a content',
			},
		],
		default: 'getAll',
	},
	// --- Endpoint field (common for all operations) ---
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['get', 'getAll', 'create', 'update', 'delete'],
			},
		},
		description: 'The API endpoint name (e.g., blogs, news)',
		placeholder: 'blogs',
	},
	// --- Content ID field (for get, update, delete) ---
	{
		displayName: 'Content ID',
		name: 'contentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the content',
	},
	// --- Options for 'Get All' operation ---
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'ID,title,publishedAt',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'string',
				default: '',
				description: 'Filter query string (e.g., category[equals]news)',
				placeholder: 'category[equals]news',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of content IDs to filter',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Number of results to skip',
			},
			{
				displayName: 'Orders',
				name: 'orders',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to order by (use - for descending)',
				placeholder: '-publishedAt,title',
			},
			{
				displayName: 'Q',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Full-text search query',
			},
		],
	},
	// --- Options for 'Get' operation ---
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Draft Key',
				name: 'draftKey',
				type: 'string',
				default: '',
				description: 'Key to access draft content',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'ID,title,publishedAt',
			},
		],
	},
	// --- Body field (for create and update) ---
	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['create', 'update'],
			},
		},
		description: 'The content body in JSON format',
		placeholder: '{"title": "My Blog Post", "content": "Hello World"}',
	},
];