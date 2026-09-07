import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dataDir = mkdtempSync(join(tmpdir(), 'kaiwu-hub-test-'))
const port = 3399
const base = `http://127.0.0.1:${port}`
const adminToken = 'test-admin-token'

function startHub() {
  const child = spawn(process.execPath, ['scripts/hub-runner.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, KAIWU_ENTERPRISE_HUB_PORT: String(port), KAIWU_ENTERPRISE_DATA_DIR: dataDir, KAIWU_ENTERPRISE_ADMIN_TOKEN: adminToken },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((resolve, reject) => {
    let output = ''
    const timer = setTimeout(() => reject(new Error(`hub start timeout: ${output}`)), 10000)
    child.stdout.on('data', (chunk) => { output += chunk; if (output.includes('READY')) { clearTimeout(timer); resolve(child) } })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('exit', (code) => { if (!output.includes('READY')) { clearTimeout(timer); reject(new Error(`hub exited ${code}: ${output}`)) } })
  })
}

function stopHub(child) {
  return new Promise((resolve) => { child.once('exit', resolve); child.kill('SIGTERM') })
}

async function request(path, { token, body, origin } = {}) {
  return fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'content-type': 'application/json; charset=utf-8' }), ...(origin ? { origin } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

let hub
try {
  hub = await startHub()
  assert.equal((await request('/api/health')).status, 200)
  assert.equal((await request('/api/state')).status, 401)
  assert.equal((await request('/api/state', { token: 'wrong' })).status, 401)
  assert.equal((await request('/api/health', { origin: 'https://evil.example' })).status, 403)

  const codeResponse = await request('/api/admin/enrollment-codes', { token: adminToken, body: { label: '自动验收', maxUses: 2, expiresInHours: 1 } })
  assert.equal(codeResponse.status, 200)
  const { code } = await codeResponse.json()
  assert.ok(code)
  assert.equal((await request('/api/enroll', { body: { id: 'terminal-invalid', enrollmentCode: 'wrong' } })).status, 403)

  const enrollment = await request('/api/enroll', { body: { id: 'terminal-test-001', enrollmentCode: code, name: '验收员工端', hostname: 'test-host', port: 3383, version: '0.5.0' } })
  assert.equal(enrollment.status, 200)
  const credentials = await enrollment.json()
  assert.ok(credentials.token)
  assert.equal((await request('/api/terminal/heartbeat', { token: 'wrong', body: { id: 'terminal-test-001' } })).status, 401)

  const worker = { knowledge: [], sops: [], skills: [], tools: [], profile: { department: '测试部' } }
  const heartbeat = await request('/api/terminal/heartbeat', { token: credentials.token, body: { id: 'terminal-test-001', name: '验收员工端', hostname: 'test-host', version: '0.5.0', workers: { 'kaiwu-watermark': worker }, sessionCount: 3, sessionsByWorker: { 'kaiwu-watermark': 3 } } })
  assert.equal(heartbeat.status, 200)

  const batch = await request('/api/batch', { token: adminToken, body: { terminalIds: ['terminal-test-001'], workerIds: ['kaiwu-watermark'], payload: { action: 'addKnowledge', name: '跨设备验收资料', content: 'UTF-8 中文内容' }, actionLabel: '增加资料', detail: '自动验收' } })
  assert.equal(batch.status, 200)
  const pull = await (await request('/api/terminal/heartbeat', { token: credentials.token, body: { id: 'terminal-test-001', name: '验收员工端', hostname: 'test-host', version: '0.5.0', workers: { 'kaiwu-watermark': worker }, sessionCount: 3, sessionsByWorker: { 'kaiwu-watermark': 3 } } })).json()
  assert.equal(pull.commands.length, 1)
  const command = pull.commands[0]
  assert.equal((await request(`/api/terminal/commands/${command.id}/start`, { token: credentials.token, body: { terminalId: 'terminal-test-001' } })).status, 200)
  assert.equal((await request(`/api/terminal/commands/${command.id}/ack`, { token: credentials.token, body: { terminalId: 'terminal-test-001', success: true, result: '成功' } })).status, 200)

  let state = await (await request('/api/state', { token: adminToken })).json()
  assert.equal(state.terminals.length, 1)
  assert.equal(state.terminals[0].sessionCount, 3)
  assert.equal(state.commandSummary.succeeded, 1)
  assert.ok(state.audit.some((entry) => entry.result === '成功'))

  await stopHub(hub); hub = null
  hub = await startHub()
  state = await (await request('/api/state', { token: adminToken })).json()
  assert.equal(state.terminals.length, 1)
  assert.equal(state.commandSummary.succeeded, 1)
  assert.ok(readFileSync(join(dataDir, 'enterprise.db')).length > 0)
  console.log(JSON.stringify({ ok: true, checks: 18, dataDir, terminalId: state.terminals[0].id, commandSummary: state.commandSummary }, null, 2))
} finally {
  if (hub) await stopHub(hub)
  rmSync(dataDir, { recursive: true, force: true })
}
