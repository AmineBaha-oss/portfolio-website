const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createHmac, randomUUID } = require('node:crypto');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const { drizzle } = require('drizzle-orm/pglite');
const { NextRequest } = require('next/server');

// Execute the real route handlers against isolated, in-memory PostgreSQL.
// Only their database import is replaced; auth, validation and SQL remain real.
const pg = new PGlite();
const cache = new Map();
let db;
function source(relative) {
  const filename = path.resolve(__dirname, '../src', relative);
  if (cache.has(filename)) return cache.get(filename);
  const module = { exports: {} };
  cache.set(filename, module.exports);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const localRequire = name => {
    if (name === '@/lib/db') return { get db() { return db; }, ...source('lib/db/schema.ts') };
    if (name.startsWith('@/')) return source(name.slice(2) + '.ts');
    if (name.startsWith('.')) return source(path.relative(path.resolve(__dirname, '../src'), path.resolve(path.dirname(filename), name + '.ts')));
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}
const passcodeBefore = process.env.ADMIN_PASSCODE;
process.env.ADMIN_PASSCODE = 'activities-test-only';
const token = createHmac('sha256', process.env.ADMIN_PASSCODE).update('admin-session').digest('hex');
const collection = source('app/api/admin/activities/route.ts');
const item = source('app/api/admin/activities/[id]/route.ts');
const publicRoute = source('app/api/public/activities/route.ts');
function request(method, data, authenticated = true, url = 'http://localhost/api/admin/activities') {
  return new NextRequest(url, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: 'Bearer ' + token } : {}) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
}
const context = id => ({ params: Promise.resolve({ id }) });
function input(overrides = {}) {
  return { title: { en: 'Test hackathon', fr: 'Hackathon de test' }, description: { en: 'Built with a team.', fr: 'Réalisé en équipe.' }, period: { en: '2026', fr: '2026' }, organization: null, location: null, category: 'hackathon', technologies: ['TypeScript'], order: 1, published: false, projectId: null, eventUrl: null, ...overrides };
}
async function publicActivities(lang = 'en') {
  const response = await publicRoute.GET(request('GET', undefined, false, 'http://localhost/api/public/activities?lang=' + lang));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  return (await response.json()).activities;
}
before(async () => {
  await pg.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE portfolio_app BYPASSRLS; CREATE ROLE service_role BYPASSRLS;
    CREATE TABLE projects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status text NOT NULL DEFAULT 'draft');`);
  await pg.exec(readFileSync(path.resolve(__dirname, '../drizzle/0005_add_activities.sql'), 'utf8'));
  db = drizzle(pg);
});
after(async () => {
  await pg.close();
  if (passcodeBefore === undefined) delete process.env.ADMIN_PASSCODE;
  else process.env.ADMIN_PASSCODE = passcodeBefore;
});
test('every admin action rejects unauthenticated requests', async () => {
  assert.equal((await collection.GET(request('GET', undefined, false))).status, 403);
  assert.equal((await collection.POST(request('POST', input(), false))).status, 403);
  assert.equal((await item.PUT(request('PUT', input(), false), context(randomUUID()))).status, 403);
  assert.equal((await item.DELETE(request('DELETE', undefined, false), context(randomUUID()))).status, 403);
});
test('invalid bilingual content, types, IDs and unsafe URLs are rejected', async () => {
  for (const invalid of [input({ title: { en: 'English only', fr: '' } }), input({ description: [] }), input({ order: -1 }), input({ order: 1.5 }), input({ published: 'false' }), input({ eventUrl: 'javascript:alert(1)' }), input({ category: 'unknown' }), input({ projectId: 'not-a-uuid' }), input({ technologies: [null] })]) {
    assert.equal((await collection.POST(request('POST', invalid))).status, 400);
  }
  const malformed = new NextRequest('http://localhost/api/admin/activities', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: '{' });
  assert.equal((await collection.POST(malformed)).status, 400);
  assert.equal((await item.PUT(request('PUT', input()), context('bad'))).status, 400);
  assert.equal((await item.DELETE(request('DELETE'), context('bad'))).status, 400);
  assert.equal((await item.PUT(request('PUT', input()), context(randomUUID()))).status, 404);
  assert.equal((await item.DELETE(request('DELETE'), context(randomUUID()))).status, 404);
  assert.equal((await collection.POST(request('POST', input({ projectId: randomUUID() })))).status, 400);
});
test('admin CRUD persists content; public API localizes, orders and hides drafts', async () => {
  const response = await collection.POST(request('POST', input()));
  assert.equal(response.status, 201);
  const { activity } = await response.json();
  assert.equal((await publicActivities()).length, 0);
  const adminList = await collection.GET(request('GET'));
  assert.equal((await adminList.json()).activities.length, 1);
  const updated = await item.PUT(request('PUT', input({ published: true, order: 20 })), context(activity.id));
  assert.equal(updated.status, 200);
  assert.equal((await publicActivities('fr'))[0].title, 'Hackathon de test');
  assert.equal((await publicActivities('en'))[0].description, 'Built with a team.');
  const earlier = await collection.POST(request('POST', input({ title: { en: 'Earlier', fr: 'Avant' }, published: true, order: 0 })));
  const earlierId = (await earlier.json()).activity.id;
  assert.deepEqual((await publicActivities()).map(a => a.order), [0, 20]);
  assert.equal((await item.DELETE(request('DELETE'), context(activity.id))).status, 200);
  assert.equal((await publicActivities()).length, 1);
  await item.DELETE(request('DELETE'), context(earlierId));
  assert.equal((await publicActivities()).length, 0);
});
test('draft projects are not linked publicly and deleting a project preserves its activity', async () => {
  const projectId = randomUUID();
  await pg.query('INSERT INTO projects(id,status) VALUES ($1,$2)', [projectId, 'draft']);
  const created = await collection.POST(request('POST', input({ projectId, published: true })));
  const id = (await created.json()).activity.id;
  assert.equal((await publicActivities())[0].projectId, null);
  await pg.query("UPDATE projects SET status='published' WHERE id=$1", [projectId]);
  assert.equal((await publicActivities())[0].projectId, projectId);
  await pg.query('DELETE FROM projects WHERE id=$1', [projectId]);
  assert.equal((await publicActivities())[0].projectId, null);
  await item.DELETE(request('DELETE'), context(id));
});
test('direct Supabase client roles cannot access or modify activities', async () => {
  for (const role of ['anon', 'authenticated']) {
    await pg.exec('SET ROLE ' + role);
    try { await assert.rejects(pg.query('SELECT * FROM activities'), /permission denied/); }
    finally { await pg.exec('RESET ROLE'); }
  }
});
