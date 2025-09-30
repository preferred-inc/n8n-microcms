# n8n-nodes-microcms

This is an n8n community node. It lets you use microCMS in your n8n workflows.

[microCMS](https://microcms.io/) is a headless CMS platform that provides API-based content management services. It enables developers to manage and deliver content through a RESTful API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following operations:

### Content (Content API)
- **Get**: Retrieve a single content item by ID
- **Get Many**: Retrieve a list of content items with optional filters
- **Create**: Create a new content item
- **Update**: Update an existing content item
- **Delete**: Delete a content item

#### Get Many Options
When using the "Get Many" operation, you can specify additional options:
- **Limit**: Maximum number of results to return
- **Offset**: Number of items to skip for pagination
- **Orders**: Sort order for results (use `-` prefix for descending)
- **Fields**: Comma-separated list of fields to return
- **Filters**: Advanced filtering queries
- **IDs**: Comma-separated list of content IDs to retrieve
- **Query (q)**: Full-text search query

#### Get Options
When using the "Get" operation, you can specify:
- **Draft Key**: Key to access draft content
- **Fields**: Comma-separated list of fields to return

### Management (Management API)
- **Update Status**: Change content status to PUBLISH or DRAFT
- **Upload Media**: Upload media files (images, videos, etc.) to microCMS

#### Update Status
Change the publication status of existing content. Useful for automating content publishing workflows.

#### Upload Media
Upload binary files to microCMS media library. The node accepts binary data from previous nodes (e.g., HTTP Request, Read Binary File).

## Credentials

To use this node, you need a microCMS account and API credentials:

1. Sign up for a [microCMS account](https://microcms.io/)
2. Create a service in your microCMS dashboard
3. Generate API keys with appropriate permissions:
   - **Content API Key**: For reading and writing content (required)
   - **Management API Key**: For media uploads and status changes (optional, only needed for Management operations)
4. In n8n, create new microCMS API credentials with:
   - **Service Domain**: Your microCMS service domain (e.g., `your-service` from `https://your-service.microcms.io`)
   - **API Key**: Your microCMS Content API key
   - **Management API Key**: Your microCMS Management API key (optional, required only for Management operations)

## Compatibility

- Minimum n8n version: 0.150.0
- Tested with n8n version: 1.0.0+

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [microCMS Content API Documentation](https://document.microcms.io/content-api/get-list-contents)
* [microCMS Management API Documentation](https://document.microcms.io/management-api/overview)
* [microCMS Official Website](https://microcms.io/)

## License

[MIT](LICENSE.md)