/**
 * 企业管理端本机中枢：接收员工端心跳、汇总资产、下发配置并记录审计。
 * 基础版只监听 127.0.0.1，浏览器来源也限制为本机 DSH 页面。
 */
import { createServer } from 'node:http'
import { join } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const HUB_HOST = '127.0.0.1'
const HUB_PORT = Number(process.env.KAIWU_ENTERPRISE_HUB_PORT || 3099)
const HUB_URL = `http://${HUB_HOST}:${HUB_PORT}`
const DATA_DIR = join(process.env.LOCALAPPDATA || process.env.TEMP || '.', 'kaiwu-praxis-enterprise')
const DATA_FILE = join(DATA_DIR, 'enterprise-hub.json')
const VERSION = '0.1.0'

let hubPromise
let hubState = { terminals: {}, commands: [], audit: [] }
let saveChain = Promise.resolve()

function cors(res, origin = '') {
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
}

function send(res, status, value) {
  res.statusCode = status
  res.end(`${JSON.stringify(value)}\n`)
}

async function bodyOf(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function loadState() {
  try {
    const parsed = JSON.parse(await readFile(DATA_FILE, 'utf8'))
    hubState = {
      terminals: parsed.terminals || {},
      commands: Array.isArray(parsed.commands) ? parsed.commands : [],
      audit: Array.isArray(parsed.audit) ? parsed.audit.slice(-500) : [],
    }
  } catch {
    // 首次启动没有持久化文件。
  }
}

function persist() {
  saveChain = saveChain.then(async () => {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(DATA_FILE, `${JSON.stringify(hubState, null, 2)}\n`, 'utf8')
  }).catch(() => {})
  return saveChain
}

function visibleState() {
  const now = Date.now()
  const terminals = Object.values(hubState.terminals).map((terminal) => ({
    ...terminal,
    status: now - Date.parse(terminal.lastSeen || 0) < 15000 ? 'online' : 'offline',
  }))
  return { version: VERSION, terminals, audit: hubState.audit.slice().reverse() }
}

function appendAudit(entry) {
  hubState.audit.push({
    id: entry.id || `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: entry.time || new Date().toISOString(),
    operator: entry.operator || '企业管理员',
    action: entry.action || '',
    target: entry.target || '',
    detail: entry.detail || '',
    result: entry.result || '成功',
  })
  hubState.audit = hubState.audit.slice(-500)
}

async function handle(req, res) {
  const origin = String(req.headers.origin || '')
  if (origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) {
    res.statusCode = 403
    res.end('forbidden\n')
    return
  }
  cors(res, origin)
  if (req.method === 'OPTIONS') return send(res, 204, {})
  const url = new URL(req.url || '/', HUB_URL)
  if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, visibleState())
  if (req.method === 'POST' && url.pathname === '/api/register') {
    const data = await bodyOf(req)
    if (!data.id) return send(res, 400, { ok: false, error: 'terminal id required' })
    hubState.terminals[data.id] = {
      ...(hubState.terminals[data.id] || {}),
      ...data,
      role: 'endpoint',
      lastSeen: new Date().toISOString(),
    }
    const commands = hubState.commands.filter((item) => item.terminalId === data.id && !item.ackedAt)
    await persist()
    return send(res, 200, { ok: true, commands })
  }
  if (req.method === 'POST' && url.pathname === '/api/usage') {
    const data = await bodyOf(req)
    const terminal = Object.values(hubState.terminals).find((item) => Number(item.port) === Number(data.port))
    if (!terminal) return send(res, 404, { ok: false, error: 'terminal not registered' })
    terminal.sessionCount = Number(data.sessionCount) || 0
    terminal.sessionsByWorker = data.sessionsByWorker || {}
    terminal.usageUpdatedAt = new Date().toISOString()
    await persist()
    return send(res, 200, { ok: true })
  }
  if (req.method === 'POST' && url.pathname === '/api/batch') {
    const data = await bodyOf(req)
    const terminalIds = Array.isArray(data.terminalIds) ? data.terminalIds : []
    if (terminalIds.length === 0 || !Array.isArray(data.workerIds) || data.workerIds.length === 0) {
      return send(res, 400, { ok: false, error: 'targets required' })
    }
    const batchId = `batch-${Date.now()}-${Math.random().toString(16).slice(2)}`
    for (const terminalId of terminalIds) {
      hubState.commands.push({
        id: `${batchId}-${terminalId}`,
        batchId,
        terminalId,
        payload: data.payload,
        workerIds: data.workerIds,
        createdAt: new Date().toISOString(),
      })
    }
    appendAudit({
      id: batchId,
      action: data.actionLabel || data.payload?.action || '批量配置',
      target: `${terminalIds.length} 个终端 / ${data.workerIds.length} 类员工`,
      detail: data.detail || '',
      result: '已下发',
    })
    await persist()
    return send(res, 200, { ok: true, batchId })
  }
  if (req.method === 'POST' && url.pathname === '/api/ack') {
    const data = await bodyOf(req)
    const command = hubState.commands.find((item) => item.id === data.commandId)
    if (command) {
      command.ackedAt = new Date().toISOString()
      command.result = data.result || '成功'
      const related = hubState.commands.filter((item) => item.batchId === command.batchId)
      const audit = hubState.audit.find((item) => item.id === command.batchId)
      if (audit) {
        const finished = related.filter((item) => item.ackedAt)
        const failed = finished.find((item) => item.result !== '成功')
        audit.result = failed ? failed.result : finished.length === related.length ? '成功' : '执行中'
      }
      await persist()
    }
    return send(res, 200, { ok: true })
  }
  return send(res, 404, { ok: false, error: 'not found' })
}

export async function ensureEnterpriseHub(logger) {
  if (hubPromise) return hubPromise
  hubPromise = (async () => {
    await loadState()
    const server = createServer((req, res) => {
      handle(req, res).catch((error) => send(res, 500, { ok: false, error: error.message }))
    })
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(HUB_PORT, HUB_HOST, resolve)
    })
    logger?.info?.(`kaiwu-praxis-enterprise: hub ready at ${HUB_URL}`)
    return HUB_URL
  })()
  return hubPromise
}

export { HUB_URL }
