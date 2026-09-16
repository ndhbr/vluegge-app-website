import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://127.0.0.1:5055';
const callbacks = ['/auth/password-recovery', '/identity/return'];
const associations = [
  '/.well-known/assetlinks.json',
  '/.well-known/apple-app-site-association',
];
const bodies = new Map();

for (const path of [...callbacks, ...associations]) {
  for (const query of ['', '?code=hosting-check&state=one%2Btwo%26three&type=recovery']) {
    const response = await fetch(new URL(path + query, base), { redirect: 'manual' });
    assert.equal(response.status, 200, `${path}: expected HTTP 200 without a redirect`);
    assert.equal(response.headers.get('location'), null, `${path}: unexpected redirect`);
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
    assert.match(response.headers.get('content-security-policy') ?? '', /default-src 'none'/);

    const contentType = response.headers.get('content-type')?.split(';')[0];
    assert.equal(contentType, associations.includes(path) ? 'application/json' : 'text/html');
    const body = await response.text();
    if (query) {
      assert.equal(body, bodies.get(path), `${path}: query parameters changed the response`);
      assert.ok(!body.includes('hosting-check'), `${path}: callback data exposed`);
    } else {
      bodies.set(path, body);
    }

    if (callbacks.includes(path)) {
      assert.match(body, /<html lang="de">/);
      assert.ok(!/<script\b|<iframe\b|<form\b|http-equiv\s*=/i.test(body));
      assert.ok(!/\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i.test(body));
    }
  }
  console.log(`OK ${path}: 200, expected headers, unchanged response with query parameters`);
}

const android = JSON.parse(bodies.get(associations[0]));
assert.deepEqual(android[0].relation, ['delegate_permission/common.handle_all_urls']);
assert.equal(android[0].target.namespace, 'android_app');
assert.equal(android[0].target.package_name, 'de.bavarianbits.vluegge');
const fingerprints = android[0].target.sha256_cert_fingerprints;
assert.ok(Array.isArray(fingerprints) && fingerprints.length > 0);
for (const fingerprint of fingerprints) {
  assert.ok(fingerprint === '<PRODUCTION_SHA256_CERT_FINGERPRINT>' || /^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/i.test(fingerprint));
}
if (fingerprints.includes('<PRODUCTION_SHA256_CERT_FINGERPRINT>')) {
  console.log('NOTE Android fingerprint is still a placeholder; App Links cannot verify yet.');
}

const apple = JSON.parse(bodies.get(associations[1]));
assert.deepEqual(apple.applinks.apps, []);
assert.equal(apple.applinks.details[0].appID, 'T9PMR76382.com.vluegge.app');
assert.deepEqual(apple.applinks.details[0].paths, callbacks);

const unknown = await fetch(new URL('/not-a-callback', base), { redirect: 'manual' });
assert.equal(unknown.status, 404, 'Unknown paths must not render a callback page');
console.log('OK association contents and unknown-path 404');
