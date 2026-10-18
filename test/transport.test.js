// ビルド済みの dist に対して、n8n を起動せずに転送層とノードの組み立てを確かめる。
// 実行: npm test（build してから node --test）
const test = require('node:test');
const assert = require('node:assert/strict');

const {
	assertServiceDomain,
	buildMultipartBody,
	contentPath,
	microCmsApiRequest,
	microCmsManagementApiRequest,
	microCmsUploadMedia,
} = require('../dist/nodes/MicroCms/transport');
const { MicroCms } = require('../dist/nodes/MicroCms/MicroCms.node');

/** IExecuteFunctions の最小の偽物。送ったリクエストを記録する。 */
function fakeContext({ credentials, params = {}, items = [{ json: {} }], response = { ok: true } } = {}) {
	const sent = [];
	const ctx = {
		sent,
		getCredentials: async () => ({
			serviceDomain: 'my-service',
			apiKey: 'content-key',
			managementApiKey: 'management-key',
			...credentials,
		}),
		getNode: () => ({ name: 'microCMS', type: 'n8n-nodes-microcms.microCms', typeVersion: 1, parameters: {} }),
		getInputData: () => items,
		getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
		continueOnFail: () => false,
		helpers: {
			httpRequest: async (options) => {
				sent.push(options);
				return response;
			},
			httpRequestWithAuthentication: async () => {
				throw new Error('httpRequestWithAuthentication must not be used (it overrides the API key header)');
			},
			assertBinaryData: () => ({ fileName: 'photo "1".png', mimeType: 'image/png' }),
			getBinaryDataBuffer: async () => Buffer.from([0x89, 0x50, 0x4e, 0x47]),
		},
	};
	return ctx;
}

test('assertServiceDomain: サブドメインだけを通し、別ホストへ向く値は弾く', () => {
	assert.equal(assertServiceDomain(' my-service '), 'my-service');
	assert.equal(assertServiceDomain('abc123'), 'abc123');
	for (const bad of ['', 'evil.example.com', 'evil.example.com/x?', 'a b', '-lead', 'trail-', 'my_service', undefined]) {
		assert.throws(() => assertServiceDomain(bad), /Invalid microCMS Service Domain/, String(bad));
	}
});

test('contentPath: 区切り文字をエンコードして別の API を叩かない', () => {
	assert.equal(contentPath('blogs'), '/blogs');
	assert.equal(contentPath('blogs', 'abc-123'), '/blogs/abc-123');
	assert.equal(contentPath('blogs', '../media?x=1'), '/blogs/..%2Fmedia%3Fx%3D1');
});

test('buildMultipartBody: 1ファイルの multipart 本文を組み立て、ファイル名の引用符・改行を潰す', () => {
	const { body, contentType } = buildMultipartBody('file', Buffer.from('DATA'), 'a"b\r\n.png', 'image/png', 'BOUNDARY');
	assert.equal(contentType, 'multipart/form-data; boundary=BOUNDARY');
	assert.equal(
		body.toString(),
		'--BOUNDARY\r\n' +
			'Content-Disposition: form-data; name="file"; filename="a_b__.png"\r\n' +
			'Content-Type: image/png\r\n\r\n' +
			'DATA\r\n--BOUNDARY--\r\n',
	);
});

test('Content API: Content API のキーで、サービスドメインの URL へ送る', async () => {
	const ctx = fakeContext();
	await microCmsApiRequest.call(ctx, 'GET', '/blogs', undefined, { limit: 10 });
	assert.equal(ctx.sent[0].url, 'https://my-service.microcms.io/api/v1/blogs');
	assert.equal(ctx.sent[0].headers['X-MICROCMS-API-KEY'], 'content-key');
	assert.deepEqual(ctx.sent[0].qs, { limit: 10 });
});

test('Content API: 不正なサービスドメインではリクエストを出さない（キーを漏らさない）', async () => {
	const ctx = fakeContext({ credentials: { serviceDomain: 'evil.example.com/x?' } });
	await assert.rejects(microCmsApiRequest.call(ctx, 'GET', '/blogs'), /Invalid microCMS Service Domain/);
	assert.equal(ctx.sent.length, 0);
});

test('Management API: Management のキーで送り、キーが無ければ止める', async () => {
	const ctx = fakeContext();
	await microCmsManagementApiRequest.call(ctx, 'PATCH', '/contents/blogs/x/status', { status: ['PUBLISH'] });
	assert.equal(ctx.sent[0].url, 'https://my-service.microcms-management.io/api/v1/contents/blogs/x/status');
	assert.equal(ctx.sent[0].headers['X-MICROCMS-API-KEY'], 'management-key');

	const noKey = fakeContext({ credentials: { managementApiKey: '' } });
	await assert.rejects(microCmsManagementApiRequest.call(noKey, 'GET', '/media'), /Management API Key is required/);
	assert.equal(noKey.sent.length, 0);
});

test('メディアのアップロード: Management のキーで multipart を送る（Content のキーで上書きされない）', async () => {
	const ctx = fakeContext({ response: { url: 'https://images.microcms-assets.io/x.png' } });
	const res = await microCmsUploadMedia.call(ctx, 'data', 0);
	assert.deepEqual(res, { url: 'https://images.microcms-assets.io/x.png' });

	const req = ctx.sent[0];
	assert.equal(req.method, 'POST');
	assert.equal(req.url, 'https://my-service.microcms-management.io/api/v1/media');
	assert.equal(req.headers['X-MICROCMS-API-KEY'], 'management-key');
	assert.match(req.headers['Content-Type'], /^multipart\/form-data; boundary=/);
	assert.ok(Buffer.isBuffer(req.body));
	const text = req.body.toString('latin1');
	assert.match(text, /name="file"; filename="photo _1_.png"/);
	assert.match(text, /Content-Type: image\/png/);
	assert.ok(req.body.includes(Buffer.from([0x89, 0x50, 0x4e, 0x47])));
});

test('ノード: update は ID をエンコードした PATCH、壊れた JSON は送らずにエラー', async () => {
	const node = new MicroCms();
	const ctx = fakeContext({
		params: { resource: 'content', operation: 'update', endpoint: 'blogs', contentId: 'a/b', body: '{"title":"x"}' },
	});
	await node.execute.call(ctx);
	assert.equal(ctx.sent[0].method, 'PATCH');
	assert.equal(ctx.sent[0].url, 'https://my-service.microcms.io/api/v1/blogs/a%2Fb');
	assert.deepEqual(ctx.sent[0].body, { title: 'x' });

	const bad = fakeContext({
		params: { resource: 'content', operation: 'create', endpoint: 'blogs', body: '{not json' },
	});
	await assert.rejects(node.execute.call(bad), /Body must be valid JSON/);
	assert.equal(bad.sent.length, 0);
});

test('ノード: ステータス変更は Management API の status エンドポイントへ配列で送る', async () => {
	const node = new MicroCms();
	const ctx = fakeContext({
		params: { resource: 'management', operation: 'updateStatus', endpoint: 'blogs', contentId: 'abc', status: 'DRAFT' },
	});
	const [out] = await node.execute.call(ctx);
	assert.equal(ctx.sent[0].url, 'https://my-service.microcms-management.io/api/v1/contents/blogs/abc/status');
	assert.deepEqual(ctx.sent[0].body, { status: ['DRAFT'] });
	assert.equal(out[0].json.status, 'DRAFT');
});
