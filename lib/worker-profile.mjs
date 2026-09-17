/**
 * 企业管理端员工档案契约（对照 StaffDeck /enterprise/dashboard）。
 * 与员工端独立安装，故不依赖 kaiwu-praxis 模块；字段需与员工端 ProfileSchema 对齐。
 */

export {
  conversationCountForWorker,
  employeeDashboardMetrics,
  normalizeFeedbackBucket,
  sumFeedbackBuckets,
} from './usage/index.mjs'

export const WORKER_IDS = [
  'kaiwu-watermark',
  'kaiwu-docbutler',
  'kaiwu-content',
  'kaiwu-competitor',
  'kaiwu-research',
  'kaiwu-brand-auditor',
  'kaiwu-data-tracker',
]

const PROFILE_SEED = {
  'kaiwu-watermark': {
    staffNo: 'KW-WM-001',
    roleName: '文件安全助手',
    department: '信息安全',
    description: '仅处理本地 PDF/图片水印与导出；不访问外网、不改动原文业务数据。',
    personaPrompt: '严谨、可复核；先确认目标路径再批量处理。不得把未加水印文件当作已完成交付。',
    summary: '批量给 PDF / 图片加水印，本地零联网（资料防泄密、客户方案外发）。',
    workStyles: ['证据优先', '动作可追溯', '风险克制'],
    expertiseTags: ['资料维护', '工具调用', '业务问答'],
    workModes: ['确认后执行', '执行并复盘'],
  },
  'kaiwu-docbutler': {
    staffNo: 'KW-DOC-001',
    roleName: '投标资料管家',
    department: '商务支持',
    description: '整理、分类、重命名与格式转换本地资料；不擅自删除未确认的文件。',
    personaPrompt: '条理清晰，输出清单与落盘路径；删除或覆盖前必须得到人工确认。',
    summary: '分类归档、批量重命名与格式转换，把投标与项目资料管齐。',
    workStyles: ['流程推进', '动作可追溯', '及时追问'],
    expertiseTags: ['资料维护', '事务跟进', 'SOP 执行'],
    workModes: ['补齐信息', '查询资料', '执行并复盘'],
  },
  'kaiwu-content': {
    staffNo: 'KW-CNT-001',
    roleName: '营销文案员',
    department: '市场部',
    description: '撰写与改写营销内容；对外承诺需人工确认后才能定稿外发。',
    personaPrompt: '简洁有重点，保留可追溯来源；不得编造未授权的数据和对外承诺。',
    summary: '面向方案、海报与活动页的内容撰写与改写。',
    workStyles: ['事实先行', '目标明确'],
    expertiseTags: ['业务问答', '资料维护'],
    workModes: ['识别意图', '补齐信息', '确认后执行'],
  },
  'kaiwu-competitor': {
    staffNo: 'KW-CMP-001',
    roleName: '竞品分析专家',
    department: '战略研究',
    description: '基于公开信息做竞品对照；不编造未验证的份额或报价。',
    personaPrompt: '对比表优先，结论带出处；区分已知事实、推断与待核实项。',
    summary: '检索公开竞品信息并整理对照分析。',
    workStyles: ['证据优先', '风险克制'],
    expertiseTags: ['业务问答', '资料维护'],
    workModes: ['查询资料', '执行并复盘'],
  },
  'kaiwu-research': {
    staffNo: 'KW-RSH-001',
    roleName: '情报官',
    department: '行业研究',
    description: '多源公开情报采集与简报；不把传闻写成既定事实。',
    personaPrompt: '覆盖面广，标注时效与来源；传闻只能作为线索，不得升格为结论。',
    summary: '行业与客户情报采集，输出可核对的简报。',
    workStyles: ['证据优先', '事实先行'],
    expertiseTags: ['业务问答', '资料维护'],
    workModes: ['查询资料', '执行并复盘'],
  },
  'kaiwu-brand-auditor': {
    staffNo: 'KW-BRD-001',
    roleName: '品牌诊断员',
    department: '品牌中心',
    description: '扫描公开口碑与品牌呈现；诊断建议供人工决策，不自动对外发声。',
    personaPrompt: '问题清单化，区分事实与判断；不得代替品牌方对外回复或承诺。',
    summary: '公开品牌与口碑扫描，输出诊断报告。',
    workStyles: ['事实先行', '风险克制'],
    expertiseTags: ['业务问答', '资料维护'],
    workModes: ['查询资料', '必要时转人工'],
  },
  'kaiwu-data-tracker': {
    staffNo: 'KW-DAT-001',
    roleName: '数据追踪员',
    department: '运营中心',
    description: '整理业务台账与汇报材料；缺失值不得推测填补。',
    personaPrompt: '口径固定，数字可复核；缺失值保留空缺并明示，禁止脑补。',
    summary: '追踪业务数据，生成台账与汇报材料。',
    workStyles: ['证据优先', '动作可追溯'],
    expertiseTags: ['业务问答', '资料维护', '工具调用'],
    workModes: ['查询资料', '执行并复盘'],
  },
}

function asStringArray(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export function defaultProfileFor(workerId, today = new Date().toISOString().slice(0, 10)) {
  const seed = PROFILE_SEED[workerId] || {}
  return {
    displayName: '',
    staffNo: seed.staffNo || '',
    roleName: seed.roleName || '',
    description: seed.description || '',
    personaPrompt: seed.personaPrompt || '',
    summary: seed.summary || '',
    owner: 'admin',
    department: seed.department || '运营中心',
    joinedAt: today,
    status: 'active',
    publishedToGallery: false,
    harnessMaxActions: 32,
    avatarText: '',
    avatarTone: 'blue',
    workStyles: asStringArray(seed.workStyles),
    expertiseTags: asStringArray(seed.expertiseTags),
    workModes: asStringArray(seed.workModes),
  }
}

/** 规范化档案：兼容旧 title/boundary/style；对照 StaffDeck agent_profiles + metadata_json。 */
export function normalizeProfile(seededProfile, currentProfile = {}) {
  const cur = currentProfile || {}
  const seed = seededProfile || {}
  const legacyPersona = [cur.boundary, cur.style].filter((item) => typeof item === 'string' && item.trim()).join('\n')
  const status = firstNonEmpty(cur.status, seed.status, 'active') === 'archived' ? 'archived' : 'active'
  const harness = Number(cur.harnessMaxActions ?? cur.harness_max_actions ?? seed.harnessMaxActions ?? 32)
  return {
    displayName: firstNonEmpty(cur.displayName, cur.name, seed.displayName),
    staffNo: firstNonEmpty(cur.staffNo, seed.staffNo),
    roleName: firstNonEmpty(cur.roleName, cur.title, seed.roleName),
    description: firstNonEmpty(cur.description, seed.description),
    personaPrompt: firstNonEmpty(cur.personaPrompt, legacyPersona, seed.personaPrompt),
    summary: firstNonEmpty(cur.summary, cur.system_prompt_summary, seed.summary),
    owner: firstNonEmpty(cur.owner, cur.creator_name, seed.owner, 'admin'),
    department: firstNonEmpty(cur.department, seed.department, '运营中心'),
    joinedAt: firstNonEmpty(cur.joinedAt, cur.onboarded_at, seed.joinedAt),
    status,
    publishedToGallery: cur.publishedToGallery === true || cur.published_to_gallery === true || seed.publishedToGallery === true,
    harnessMaxActions: Number.isFinite(harness) ? Math.max(1, Math.min(100, Math.round(harness))) : 32,
    avatarText: firstNonEmpty(cur.avatarText, cur.avatar_text, seed.avatarText),
    avatarTone: firstNonEmpty(cur.avatarTone, cur.avatar_tone, seed.avatarTone, 'blue'),
    workStyles: asStringArray(cur.workStyles).length ? asStringArray(cur.workStyles) : asStringArray(cur.work_styles).length ? asStringArray(cur.work_styles) : asStringArray(seed.workStyles),
    expertiseTags: asStringArray(cur.expertiseTags).length ? asStringArray(cur.expertiseTags) : asStringArray(cur.expertise_tags).length ? asStringArray(cur.expertise_tags) : asStringArray(seed.expertiseTags),
    workModes: asStringArray(cur.workModes).length ? asStringArray(cur.workModes) : asStringArray(cur.work_modes).length ? asStringArray(cur.work_modes) : asStringArray(seed.workModes),
  }
}

function isRealTimestamp(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  return Number.isFinite(Date.parse(value))
}

function stampOf(item = {}) {
  const meta = item.metadata || {}
  const candidates = [
    meta.learned_at, meta.assigned_at, meta.installed_at, meta.imported_at, meta.created_at,
    item.createdAt, item.created_at, item.updatedAt, item.updated_at,
  ]
  return candidates.find((value) => isRealTimestamp(value)) || ''
}

export function growthTimeline(worker = {}) {
  const events = []
  for (const [list, kind, titleOf] of [
    [worker.sops || [], '新增 SOP', (item, i) => item.name || `SOP ${i + 1}`],
    [(worker.skills || []).filter((item) => item && item.enabled !== false && item.deleted !== true), null, (item, i) => item.name || item.id || `技能 ${i + 1}`],
    [(worker.tools || []).filter((item) => item && item.enabled !== false), '新增工具', (item, i) => item.name || item.id || `工具 ${i + 1}`],
  ]) {
    list.forEach((item, index) => {
      const upgraded = kind === null && ((Number(item.localRevision) || 0) > 0 || item.modified === true)
      events.push({
        id: `${kind || 'skill'}-${item.id || item.name || index}`,
        kind: kind || (upgraded ? '技能升级' : '新增技能'),
        title: titleOf(item, index),
        timestamp: stampOf(item),
      })
    })
  }
  return events
    .filter((item) => item.title && isRealTimestamp(item.timestamp))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function capabilitySummary(worker = {}) {
  const skills = (worker.skills || []).filter((item) => item && item.enabled !== false && item.deleted !== true)
  const tools = (worker.tools || []).filter((item) => item && item.enabled !== false)
  const tasks = (worker.tasks || []).filter((item) => item && item.enabled !== false)
  const knowledge = worker.knowledge || []
  const sops = worker.sops || []
  return {
    skillCount: skills.length,
    knowledgeCount: knowledge.length,
    toolCount: tools.length,
    sopCount: sops.length,
    taskCount: tasks.length,
    skillNames: skills.map((item) => item.name || item.id).filter(Boolean),
    knowledgeNames: knowledge.map((item) => item.name).filter(Boolean),
    toolNames: tools.map((item) => item.name || item.id).filter(Boolean),
    sopNames: sops.map((item) => item.name).filter(Boolean),
    taskNames: tasks.map((item) => item.name).filter(Boolean),
  }
}
