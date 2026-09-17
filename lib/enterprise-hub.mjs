/**
 * 开物企业中枢：可配置监听地址、终端注册认证、SQLite 持久化与可靠指令队列。
 * 员工端只需主动访问本服务，不需要开放入站端口。
 */
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { hostname } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { defaultProfileFor, normalizeProfile } from './worker-profile.mjs'
import { normalizeFeedbackByWorker, resolveHubFeedbackJson } from './usage/index.mjs'

const HUB_HOST = process.env.KAIWU_ENTERPRISE_HUB_HOST || '127.0.0.1'
const HUB_PORT = Number(process.env.KAIWU_ENTERPRISE_HUB_PORT || 3099)
const HUB_URL = `http://${HUB_HOST}:${HUB_PORT}`
const LOCAL_HUB_HOST = process.env.KAIWU_ENTERPRISE_LOCAL_HOST || '127.0.0.1'
const LOCAL_HUB_URL = `http://${LOCAL_HUB_HOST}:${HUB_PORT}`
const DATA_DIR = process.env.KAIWU_ENTERPRISE_DATA_DIR || join(process.env.DSH_HOME || process.env.LOCALAPPDATA || process.env.TEMP || '.', '.kaiwu-enterprise')
const DATA_FILE = join(DATA_DIR, 'enterprise.db')
const VERSION = '0.2.2'
const ENTERPRISE_NAME = process.env.KAIWU_ENTERPRISE_NAME || '开物测试企业'
const ADMIN_TOKEN = process.env.KAIWU_ENTERPRISE_ADMIN_TOKEN || 'kaiwu-admin-change-me'
const SEED_CODE = process.env.KAIWU_ENTERPRISE_ENROLLMENT_CODE || ''
const MAX_BODY_BYTES = 2 * 1024 * 1024
const COMMAND_TTL_MS = 7 * 24 * 60 * 60 * 1000
const allowedOrigins = new Set(String(process.env.KAIWU_ENTERPRISE_ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean))

let hubPromise
let database

function digest(value) {
  return createHash('sha256').update(String(value || ''), 'utf8').digest('hex')
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''), 'utf8')
  const b = Buffer.from(String(right || ''), 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

function bearer(req) {
  const match = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization || ''))
  return match ? match[1] : ''
}

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.has(origin)) return true
  try {
    const url = new URL(origin)
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1'
  } catch {
    return false
  }
}

function cors(res, origin = '') {
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
}

function send(res, status, value) {
  res.statusCode = status
  res.end(`${JSON.stringify(value)}\n`)
}

async function bodyOf(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('request body too large'), { statusCode: 413 })
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('invalid json'), { statusCode: 400 })
  }
}

function openDatabase() {
  mkdirSync(DATA_DIR, { recursive: true })
  const db = new DatabaseSync(DATA_FILE)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS terminals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      host_name TEXT NOT NULL DEFAULT '',
      port INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL DEFAULT 'endpoint',
      version TEXT NOT NULL DEFAULT '',
      token_hash TEXT NOT NULL,
      workers_json TEXT NOT NULL DEFAULT '{}',
      session_count INTEGER NOT NULL DEFAULT 0,
      sessions_json TEXT NOT NULL DEFAULT '{}',
      feedback_json TEXT NOT NULL DEFAULT '{}',
      remote_address TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_seen TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS enrollment_codes (
      code_hash TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      max_uses INTEGER NOT NULL DEFAULT 1,
      uses INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS commands (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL,
      terminal_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      worker_ids_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      delivered_at TEXT,
      started_at TEXT,
      acked_at TEXT,
      result TEXT,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (terminal_id) REFERENCES terminals(id)
    );
    CREATE INDEX IF NOT EXISTS commands_terminal_status ON commands(terminal_id, status);
    CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      operator TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      detail TEXT NOT NULL,
      result TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS worker_profiles (
      worker_id TEXT PRIMARY KEY,
      profile_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );
  `)
  const terminalColumns = db.prepare('PRAGMA table_info(terminals)').all().map((row) => row.name)
  if (!terminalColumns.includes('feedback_json')) {
    db.exec(`ALTER TABLE terminals ADD COLUMN feedback_json TEXT NOT NULL DEFAULT '{}'`)
  }
  if (SEED_CODE) {
    const now = new Date().toISOString()
    const expires = new Date(Date.now() + COMMAND_TTL_MS).toISOString()
    db.prepare('INSERT OR IGNORE INTO enrollment_codes(code_hash,label,max_uses,uses,expires_at,enabled,created_at) VALUES(?,?,?,?,?,1,?)')
      .run(digest(SEED_CODE), '环境变量预置注册码', 100, 0, expires, now)
  }
  return db
}

function requireAdmin(req, res) {
  if (safeEqual(bearer(req), ADMIN_TOKEN)) return true
  send(res, 401, { ok: false, error: 'admin authentication required' })
  return false
}

function terminalForRequest(req, terminalId) {
  const token = bearer(req)
  if (!terminalId || !token) return null
  return database.prepare('SELECT * FROM terminals WHERE id=? AND token_hash=?').get(terminalId, digest(token)) || null
}

function parseJson(value, fallback) {
  try { return JSON.parse(value) } catch { return fallback }
}

function normalizeBatchPayload(payload = {}) {
  const normalized = { ...payload }
  if (['addKnowledge', 'removeKnowledge', 'addSop', 'removeSop'].includes(normalized.action)) {
    normalized.name = String(normalized.name || '').trim().replace(/\.md$/i, '')
  }
  return normalized
}

function terminalView(row) {
  return {
    id: row.id,
    name: row.name,
    hostname: row.host_name,
    port: Number(row.port) || 0,
    role: row.role,
    version: row.version,
    workers: parseJson(row.workers_json, {}),
    sessionCount: Number(row.session_count) || 0,
    sessionsByWorker: parseJson(row.sessions_json, {}),
    feedbackByWorker: normalizeFeedbackByWorker(parseJson(row.feedback_json, {})),
    remoteAddress: row.remote_address,
    createdAt: row.created_at,
    lastSeen: row.last_seen,
    status: Date.now() - Date.parse(row.last_seen || 0) < 15000 ? 'online' : 'offline',
  }
}

function listWorkerProfiles() {
  const rows = database.prepare('SELECT worker_id, profile_json, updated_at FROM worker_profiles').all()
  const profiles = {}
  for (const row of rows) {
    profiles[row.worker_id] = {
      ...normalizeProfile(defaultProfileFor(row.worker_id), parseJson(row.profile_json, {})),
      updatedAt: row.updated_at,
    }
  }
  return profiles
}

function upsertWorkerProfile(workerId, profile) {
  const id = String(workerId || '').trim()
  if (!id) throw Object.assign(new Error('workerId required'), { statusCode: 400 })
  const normalized = normalizeProfile(defaultProfileFor(id), profile || {})
  const now = new Date().toISOString()
  database.prepare(`INSERT INTO worker_profiles(worker_id, profile_json, updated_at) VALUES(?,?,?)
    ON CONFLICT(worker_id) DO UPDATE SET profile_json=excluded.profile_json, updated_at=excluded.updated_at`)
    .run(id, JSON.stringify(normalized), now)
  return { ...normalized, updatedAt: now }
}

function visibleState() {
  const terminals = database.prepare('SELECT * FROM terminals ORDER BY created_at').all().map(terminalView)
  const audit = database.prepare('SELECT * FROM audit ORDER BY time DESC LIMIT 500').all()
  const commandRows = database.prepare('SELECT status, COUNT(*) AS count FROM commands GROUP BY status').all()
  const commandSummary = {}
  for (const row of commandRows) commandSummary[row.status] = Number(row.count)
  return {
    version: VERSION,
    enterpriseName: ENTERPRISE_NAME,
    hubHost: HUB_HOST,
    hubPort: HUB_PORT,
    terminals,
    audit,
    commandSummary,
    workerProfiles: listWorkerProfiles(),
  }
}

function appendAudit(entry) {
  database.prepare('INSERT INTO audit(id,time,operator,action,target,detail,result) VALUES(?,?,?,?,?,?,?)').run(
    entry.id || `audit-${randomUUID()}`,
    entry.time || new Date().toISOString(),
    entry.operator || '企业管理员',
    entry.action || '',
    entry.target || '',
    entry.detail || '',
    entry.result || '成功',
  )
}

function updateBatchAudit(batchId) {
  const rows = database.prepare('SELECT status,result FROM commands WHERE batch_id=?').all(batchId)
  if (!rows.length) return
  const failed = rows.find((item) => item.status === 'failed')
  const result = failed ? (failed.result || '失败') : rows.every((item) => item.status === 'succeeded') ? '成功' : rows.some((item) => item.status === 'running') ? '执行中' : '已下发'
  database.prepare('UPDATE audit SET result=? WHERE id=?').run(result, batchId)
}

function listEnrollmentCodes() {
  return database.prepare('SELECT label,max_uses,uses,expires_at,enabled,created_at FROM enrollment_codes ORDER BY created_at DESC').all().map((row) => ({
    label: row.label,
    maxUses: Number(row.max_uses),
    uses: Number(row.uses),
    expiresAt: row.expires_at,
    enabled: row.enabled === 1,
    createdAt: row.created_at,
  }))
}

async function handle(req, res) {
  const origin = String(req.headers.origin || '')
  if (!isAllowedOrigin(origin)) return send(res, 403, { ok: false, error: 'origin forbidden' })
  cors(res, origin)
  if (req.method === 'OPTIONS') return send(res, 204, {})
  const url = new URL(req.url || '/', HUB_URL)

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true, version: VERSION, enterpriseName: ENTERPRISE_NAME, host: hostname() })
  }
  if (req.method === 'GET' && url.pathname === '/api/state') {
    if (!requireAdmin(req, res)) return
    return send(res, 200, visibleState())
  }
  const profileMatch = /^\/api\/workers\/([^/]+)\/profile$/.exec(url.pathname)
  if (profileMatch && req.method === 'GET') {
    if (!requireAdmin(req, res)) return
    const workerId = decodeURIComponent(profileMatch[1])
    const row = database.prepare('SELECT profile_json, updated_at FROM worker_profiles WHERE worker_id=?').get(workerId)
    const profile = normalizeProfile(defaultProfileFor(workerId), row ? parseJson(row.profile_json, {}) : {})
    return send(res, 200, { ok: true, workerId, profile: { ...profile, updatedAt: row?.updated_at || '' } })
  }
  if (profileMatch && req.method === 'PUT') {
    if (!requireAdmin(req, res)) return
    const workerId = decodeURIComponent(profileMatch[1])
    const data = await bodyOf(req)
    const profile = upsertWorkerProfile(workerId, data.profile || data)
    appendAudit({
      action: '保存员工档案',
      target: workerId,
      detail: `${profile.roleName || workerId} / ${profile.staffNo || '无工号'}`,
      result: '成功',
    })
    return send(res, 200, { ok: true, workerId, profile })
  }
  if (req.method === 'GET' && url.pathname === '/api/admin/enrollment-codes') {
    if (!requireAdmin(req, res)) return
    return send(res, 200, { ok: true, codes: listEnrollmentCodes() })
  }
  if (req.method === 'POST' && url.pathname === '/api/admin/enrollment-codes') {
    if (!requireAdmin(req, res)) return
    const data = await bodyOf(req)
    const code = randomBytes(9).toString('base64url')
    const now = new Date().toISOString()
    const hours = Math.max(1, Math.min(168, Number(data.expiresInHours) || 24))
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    const maxUses = Math.max(1, Math.min(1000, Number(data.maxUses) || 1))
    database.prepare('INSERT INTO enrollment_codes(code_hash,label,max_uses,uses,expires_at,enabled,created_at) VALUES(?,?,?,?,?,1,?)')
      .run(digest(code), String(data.label || '员工端注册码').slice(0, 100), maxUses, 0, expiresAt, now)
    appendAudit({ action: '生成注册码', target: `${maxUses} 个终端`, detail: `有效期至 ${expiresAt}`, result: '成功' })
    return send(res, 200, { ok: true, code, expiresAt, maxUses })
  }
  if (req.method === 'POST' && url.pathname === '/api/enroll') {
    const data = await bodyOf(req)
    const now = new Date().toISOString()
    const codeHash = digest(data.enrollmentCode)
    const code = database.prepare('SELECT * FROM enrollment_codes WHERE code_hash=?').get(codeHash)
    if (!code || code.enabled !== 1 || code.uses >= code.max_uses || Date.parse(code.expires_at) <= Date.now()) {
      return send(res, 403, { ok: false, error: 'invalid or expired enrollment code' })
    }
    const terminalId = String(data.id || '').trim()
    if (!/^[a-zA-Z0-9._:-]{8,160}$/.test(terminalId)) return send(res, 400, { ok: false, error: 'invalid terminal id' })
    const token = randomBytes(32).toString('base64url')
    const address = String(req.socket.remoteAddress || '')
    database.exec('BEGIN IMMEDIATE')
    try {
      database.prepare(`INSERT INTO terminals(id,name,host_name,port,role,version,token_hash,workers_json,remote_address,created_at,updated_at,last_seen)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,host_name=excluded.host_name,port=excluded.port,version=excluded.version,token_hash=excluded.token_hash,remote_address=excluded.remote_address,updated_at=excluded.updated_at,last_seen=excluded.last_seen`)
        .run(terminalId, String(data.name || terminalId).slice(0, 160), String(data.hostname || '').slice(0, 160), Number(data.port) || 0, 'endpoint', String(data.version || ''), digest(token), '{}', address, now, now, now)
      database.prepare('UPDATE enrollment_codes SET uses=uses+1 WHERE code_hash=?').run(codeHash)
      appendAudit({ action: '终端注册', target: String(data.name || terminalId), detail: terminalId, result: '成功' })
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
    return send(res, 200, { ok: true, terminalId, token, enterpriseName: ENTERPRISE_NAME })
  }
  if (req.method === 'POST' && url.pathname === '/api/terminal/heartbeat') {
    const data = await bodyOf(req)
    const terminal = terminalForRequest(req, data.id)
    if (!terminal) return send(res, 401, { ok: false, error: 'terminal authentication required' })
    const now = new Date().toISOString()
    // 省略 feedbackByWorker → 保留；空桶+零会话 → 不覆盖非空旧值（lib/usage/hub-policy.mjs）。
    const feedbackJson = resolveHubFeedbackJson(
      terminal.feedback_json,
      Object.prototype.hasOwnProperty.call(data, 'feedbackByWorker') ? data.feedbackByWorker : undefined,
      data.sessionCount,
    )
    database.prepare('UPDATE terminals SET name=?,host_name=?,port=?,version=?,workers_json=?,session_count=?,sessions_json=?,feedback_json=?,remote_address=?,updated_at=?,last_seen=? WHERE id=?')
      .run(String(data.name || terminal.name).slice(0, 160), String(data.hostname || '').slice(0, 160), Number(data.port) || 0, String(data.version || ''), JSON.stringify(data.workers || {}), Number(data.sessionCount) || 0, JSON.stringify(data.sessionsByWorker || {}), feedbackJson, String(req.socket.remoteAddress || ''), now, now, data.id)
    const rows = database.prepare("SELECT * FROM commands WHERE terminal_id=? AND status IN ('queued','delivered','running') AND expires_at>? ORDER BY created_at LIMIT 50").all(data.id, now)
    const markDelivered = database.prepare("UPDATE commands SET status=CASE WHEN status='queued' THEN 'delivered' ELSE status END,delivered_at=COALESCE(delivered_at,?),attempts=attempts+1 WHERE id=?")
    for (const row of rows) markDelivered.run(now, row.id)
    const commands = rows.map((row) => ({ id: row.id, batchId: row.batch_id, workerIds: parseJson(row.worker_ids_json, []), payload: parseJson(row.payload_json, {}), status: row.status, attempts: Number(row.attempts) + 1, createdAt: row.created_at, expiresAt: row.expires_at }))
    return send(res, 200, { ok: true, enterpriseName: ENTERPRISE_NAME, commands })
  }
  const startMatch = req.method === 'POST' && /^\/api\/terminal\/commands\/([^/]+)\/start$/.exec(url.pathname)
  if (startMatch) {
    const data = await bodyOf(req)
    const terminal = terminalForRequest(req, data.terminalId)
    if (!terminal) return send(res, 401, { ok: false, error: 'terminal authentication required' })
    const command = database.prepare('SELECT * FROM commands WHERE id=? AND terminal_id=?').get(decodeURIComponent(startMatch[1]), data.terminalId)
    if (!command) return send(res, 404, { ok: false, error: 'command not found' })
    if (!['succeeded', 'failed'].includes(command.status)) {
      database.prepare("UPDATE commands SET status='running',started_at=COALESCE(started_at,?) WHERE id=?").run(new Date().toISOString(), command.id)
      updateBatchAudit(command.batch_id)
    }
    return send(res, 200, { ok: true })
  }
  const ackMatch = req.method === 'POST' && /^\/api\/terminal\/commands\/([^/]+)\/ack$/.exec(url.pathname)
  if (ackMatch) {
    const data = await bodyOf(req)
    const terminal = terminalForRequest(req, data.terminalId)
    if (!terminal) return send(res, 401, { ok: false, error: 'terminal authentication required' })
    const command = database.prepare('SELECT * FROM commands WHERE id=? AND terminal_id=?').get(decodeURIComponent(ackMatch[1]), data.terminalId)
    if (!command) return send(res, 404, { ok: false, error: 'command not found' })
    const result = String(data.result || '成功').slice(0, 1000)
    const status = data.success === false || result.startsWith('失败') ? 'failed' : 'succeeded'
    database.prepare('UPDATE commands SET status=?,acked_at=?,result=? WHERE id=?').run(status, new Date().toISOString(), result, command.id)
    updateBatchAudit(command.batch_id)
    return send(res, 200, { ok: true })
  }
  if (req.method === 'POST' && url.pathname === '/api/batch') {
    if (!requireAdmin(req, res)) return
    const data = await bodyOf(req)
    const terminalIds = Array.isArray(data.terminalIds) ? [...new Set(data.terminalIds.map(String))] : []
    const workerIds = Array.isArray(data.workerIds) ? [...new Set(data.workerIds.map(String))] : []
    const payload = normalizeBatchPayload(data.payload)
    const allowedActions = new Set(['addKnowledge', 'removeKnowledge', 'addSop', 'removeSop', 'addSkill', 'removeSkill', 'enableTool', 'disableTool', 'updateProfile'])
    const profileOk = payload.action === 'updateProfile' && payload.profile && typeof payload.profile === 'object'
    const namedOk = payload.action !== 'updateProfile' && String(payload.name || '').trim()
    if (!terminalIds.length || !workerIds.length || !allowedActions.has(payload.action) || !(profileOk || namedOk)) {
      return send(res, 400, { ok: false, error: 'invalid batch request' })
    }
    if (payload.action === 'updateProfile') {
      for (const workerId of workerIds) {
        upsertWorkerProfile(workerId, payload.profile)
      }
      payload.profile = normalizeProfile(defaultProfileFor(workerIds[0]), payload.profile)
    }
    const placeholders = terminalIds.map(() => '?').join(',')
    const existing = database.prepare(`SELECT id FROM terminals WHERE id IN (${placeholders})`).all(...terminalIds)
    if (existing.length !== terminalIds.length) return send(res, 400, { ok: false, error: 'unknown terminal target' })
    const batchId = `batch-${randomUUID()}`
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + COMMAND_TTL_MS).toISOString()
    database.exec('BEGIN IMMEDIATE')
    try {
      const insert = database.prepare('INSERT INTO commands(id,batch_id,terminal_id,payload_json,worker_ids_json,status,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?)')
      for (const terminalId of terminalIds) insert.run(`command-${randomUUID()}`, batchId, terminalId, JSON.stringify(payload), JSON.stringify(workerIds), 'queued', now, expiresAt)
      appendAudit({ id: batchId, action: data.actionLabel || payload.action, target: `${terminalIds.length} 个终端 / ${workerIds.length} 类员工`, detail: String(data.detail || '').slice(0, 1000), result: '待执行' })
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
    return send(res, 200, { ok: true, batchId })
  }
  return send(res, 404, { ok: false, error: 'not found' })
}

export async function ensureEnterpriseHub(logger) {
  if (hubPromise) return hubPromise
  hubPromise = (async () => {
    const publicBind = !['127.0.0.1', 'localhost', '::1'].includes(HUB_HOST)
    if (publicBind && ADMIN_TOKEN === 'kaiwu-admin-change-me') {
      throw new Error('非本机监听必须设置 KAIWU_ENTERPRISE_ADMIN_TOKEN')
    }
    database = openDatabase()
    const startServer = async (host) => {
      const server = createServer((req, res) => {
        handle(req, res).catch((error) => send(res, error.statusCode || 500, { ok: false, error: error.message }))
      })
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(HUB_PORT, host, resolve)
      })
      return server
    }
    const servers = []
    try {
      servers.push(await startServer(HUB_HOST))
      if (publicBind && LOCAL_HUB_HOST !== HUB_HOST) servers.push(await startServer(LOCAL_HUB_HOST))
    } catch (error) {
      await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))))
      throw error
    }
    const server = servers[0]
    const localUrl = servers.length > 1 ? LOCAL_HUB_URL : HUB_URL
    logger?.info?.(`kaiwu-praxis-enterprise: hub ready at ${HUB_URL}; local=${localUrl}; data=${DATA_FILE}`)
    return { url: HUB_URL, localUrl, server, servers, database, dataFile: DATA_FILE }
  })()
  return hubPromise
}

export { DATA_FILE, HUB_URL, LOCAL_HUB_URL }
