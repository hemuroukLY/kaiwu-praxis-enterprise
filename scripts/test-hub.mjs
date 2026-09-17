import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dataDir = mkdtempSync(join(tmpdir(), 'kaiwu-hub-test-'))
const port = 3399
const base = `http://127.0.0.1:${port}`
const adminToken = 'test-admin-token'
// macOS 常无法 bind 127.0.0.2；本机验收以 127.0.0.1 为准。
const hubHost = process.env.KAIWU_TEST_HUB_HOST || '127.0.0.1'

function startHub() {
  const child = spawn(process.execPath, ['scripts/hub-runner.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      KAIWU_ENTERPRISE_HUB_HOST: hubHost,
      KAIWU_ENTERPRISE_LOCAL_HOST: '127.0.0.1',
      KAIWU_ENTERPRISE_HUB_PORT: String(port),
      KAIWU_ENTERPRISE_DATA_DIR: dataDir,
      KAIWU_ENTERPRISE_ADMIN_TOKEN: adminToken,
    },
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

async function request(path, { token, body, origin, method } = {}) {
  const hasBody = body !== undefined
  return fetch(base + path, {
    method: method || (hasBody ? 'POST' : 'GET'),
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(hasBody ? { 'content-type': 'application/json; charset=utf-8' } : {}),
      ...(origin ? { origin } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })
}

let hub
let checks = 0
function check(condition, label) {
  assert.ok(condition, label)
  checks += 1
}

try {
  hub = await startHub()
  check((await request('/api/health')).status === 200, 'health')
  check((await request('/api/state')).status === 401, 'state unauthorized')
  check((await request('/api/state', { token: 'wrong' })).status === 401, 'state wrong token')
  check((await request('/api/health', { origin: 'https://evil.example' })).status === 403, 'origin forbidden')

  const codeResponse = await request('/api/admin/enrollment-codes', { token: adminToken, body: { label: '自动验收', maxUses: 2, expiresInHours: 1 } })
  check(codeResponse.status === 200, 'create enrollment code')
  const { code } = await codeResponse.json()
  check(Boolean(code), 'enrollment code value')
  check((await request('/api/enroll', { body: { id: 'terminal-invalid', enrollmentCode: 'wrong' } })).status === 403, 'bad enroll')

  const enrollment = await request('/api/enroll', { body: { id: 'terminal-test-001', enrollmentCode: code, name: '验收员工端', hostname: 'test-host', port: 3383, version: '0.5.0' } })
  check(enrollment.status === 200, 'enroll')
  const credentials = await enrollment.json()
  check(Boolean(credentials.token), 'terminal token')
  check((await request('/api/terminal/heartbeat', { token: 'wrong', body: { id: 'terminal-test-001' } })).status === 401, 'heartbeat unauthorized')

  const worker = { knowledge: [], sops: [], skills: [], tools: [], profile: { department: '测试部' } }
  const heartbeat = await request('/api/terminal/heartbeat', {
    token: credentials.token,
    body: {
      id: 'terminal-test-001',
      name: '验收员工端',
      hostname: 'test-host',
      version: '0.5.0',
      workers: { 'kaiwu-watermark': worker },
      sessionCount: 3,
      sessionsByWorker: { 'kaiwu-watermark': 3 },
      feedbackByWorker: { 'kaiwu-watermark': { totalFeedback: 4, upCount: 3, downCount: 1 } },
    },
  })
  check(heartbeat.status === 200, 'heartbeat')

  const batch = await request('/api/batch', { token: adminToken, body: { terminalIds: ['terminal-test-001'], workerIds: ['kaiwu-watermark'], payload: { action: 'addKnowledge', name: '跨设备验收资料.md', content: 'UTF-8 中文内容' }, actionLabel: '增加资料', detail: '自动验收' } })
  check(batch.status === 200, 'batch addKnowledge')
  const pull = await (await request('/api/terminal/heartbeat', {
    token: credentials.token,
    body: {
      id: 'terminal-test-001',
      name: '验收员工端',
      hostname: 'test-host',
      version: '0.5.0',
      workers: { 'kaiwu-watermark': worker },
      sessionCount: 3,
      sessionsByWorker: { 'kaiwu-watermark': 3 },
      feedbackByWorker: { 'kaiwu-watermark': { totalFeedback: 4, upCount: 3, downCount: 1 } },
    },
  })).json()
  check(pull.commands.length === 1, 'pull command')
  const command = pull.commands[0]
  check(command.payload.name === '跨设备验收资料', 'normalize md suffix')
  check((await request(`/api/terminal/commands/${command.id}/start`, { token: credentials.token, body: { terminalId: 'terminal-test-001' } })).status === 200, 'command start')
  check((await request(`/api/terminal/commands/${command.id}/ack`, { token: credentials.token, body: { terminalId: 'terminal-test-001', success: true, result: '成功' } })).status === 200, 'command ack')

  let state = await (await request('/api/state', { token: adminToken })).json()
  check(state.terminals.length === 1, 'terminal count')
  check(state.terminals[0].sessionCount === 3, 'session count')
  check(state.terminals[0].feedbackByWorker?.['kaiwu-watermark']?.totalFeedback === 4, 'feedback total')
  check(state.terminals[0].feedbackByWorker?.['kaiwu-watermark']?.upCount === 3, 'feedback up')
  const hbOmit = await request('/api/terminal/heartbeat', {
    token: credentials.token,
    body: {
      id: 'terminal-test-001',
      name: '验收员工端',
      hostname: 'test-host',
      version: '0.5.0',
      workers: { 'kaiwu-watermark': worker },
      sessionCount: 3,
      sessionsByWorker: { 'kaiwu-watermark': 3 },
    },
  })
  check(hbOmit.status === 200, 'heartbeat omit feedback')
  state = await (await request('/api/state', { token: adminToken })).json()
  check(state.terminals[0].feedbackByWorker?.['kaiwu-watermark']?.totalFeedback === 4, 'feedback preserved when omitted')
  const hbEmpty = await request('/api/terminal/heartbeat', {
    token: credentials.token,
    body: {
      id: 'terminal-test-001',
      name: '验收员工端',
      hostname: 'test-host',
      version: '0.5.0',
      workers: { 'kaiwu-watermark': worker },
      sessionCount: 0,
      sessionsByWorker: {},
      feedbackByWorker: {},
    },
  })
  check(hbEmpty.status === 200, 'heartbeat empty feedback with zero sessions')
  state = await (await request('/api/state', { token: adminToken })).json()
  check(state.terminals[0].feedbackByWorker?.['kaiwu-watermark']?.totalFeedback === 4, 'feedback preserved when empty bucket + zero sessions')
  check(state.commandSummary.succeeded === 1, 'succeeded commands')
  check(state.audit.some((entry) => entry.result === '成功'), 'audit success')

  const profileBody = {
    staffNo: 'KW-WM-001',
    roleName: '文件安全助手',
    personaPrompt: '企业下发约束',
    workStyles: ['证据优先'],
    department: '信息安全',
  }
  const profilePut = await request('/api/workers/kaiwu-watermark/profile', {
    token: adminToken,
    method: 'PUT',
    body: { profile: profileBody },
  })
  check(profilePut.status === 200, 'put worker profile')
  const saved = await profilePut.json()
  check(saved.profile.roleName === '文件安全助手', 'saved roleName')
  check(saved.profile.personaPrompt === '企业下发约束', 'saved personaPrompt')

  const profileBatch = await request('/api/batch', {
    token: adminToken,
    body: {
      terminalIds: ['terminal-test-001'],
      workerIds: ['kaiwu-watermark'],
      payload: { action: 'updateProfile', profile: profileBody },
      actionLabel: '更新员工档案',
      detail: '档案验收',
    },
  })
  check(profileBatch.status === 200, 'batch updateProfile')
  const pullProfile = await (await request('/api/terminal/heartbeat', {
    token: credentials.token,
    body: { id: 'terminal-test-001', name: '验收员工端', hostname: 'test-host', version: '0.5.0', workers: { 'kaiwu-watermark': worker }, sessionCount: 3, sessionsByWorker: { 'kaiwu-watermark': 3 } },
  })).json()
  check(pullProfile.commands.length === 1, 'pull updateProfile')
  check(pullProfile.commands[0].payload.action === 'updateProfile', 'updateProfile action')
  check(pullProfile.commands[0].payload.profile.roleName === '文件安全助手', 'updateProfile payload')

  state = await (await request('/api/state', { token: adminToken })).json()
  check(state.workerProfiles['kaiwu-watermark'].staffNo === 'KW-WM-001', 'state workerProfiles')

  await stopHub(hub); hub = null
  hub = await startHub()
  state = await (await request('/api/state', { token: adminToken })).json()
  check(state.terminals.length === 1, 'persist terminals')
  check(state.workerProfiles['kaiwu-watermark'].roleName === '文件安全助手', 'persist profiles')
  check(readFileSync(join(dataDir, 'enterprise.db')).length > 0, 'db file')
  console.log(JSON.stringify({ ok: true, checks, dataDir, terminalId: state.terminals[0].id, commandSummary: state.commandSummary }, null, 2))
} finally {
  if (hub) await stopHub(hub)
  rmSync(dataDir, { recursive: true, force: true })
}
