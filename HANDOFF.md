# kaiwu-praxis-enterprise 企业端技术交接

更新日期：2026-09-09

仓库：<https://github.com/motang1219/kaiwu-praxis-enterprise>

## 1. 当前状态

这是独立的 DSH 企业管理端插件，不是 `kaiwu-praxis` 员工端中的一个页面包。

| 项目 | 状态 |
|---|---|
| GitHub `main` | 版本 `0.2.1`，标签 `v0.2.1` |
| 本地工作区 | 与已发布版本一致 |
| `0.2.1` 验收 | 已通过第二轮远程双机和第三轮公司内网多终端实测 |
| `0.2.1` 发布 | 已提交、推送和打标签 |

接手时先执行 `git status`、`git fetch --tags` 和 `git log --decorate`，确认工作区、`main` 和 `v0.2.1` 状态一致。

## 2. 职责边界

企业端负责：

- 企业总览；
- 终端列表和在线状态；
- 数字员工与使用情况汇总；
- 能力库；
- 批量配置；
- 审计；
- 接入管理和一次性注册码；
- 中枢 API、SQLite 持久化和命令队列。

企业端不包含员工 preset、本地文件工具或员工设置，也不能代替员工端。普通员工电脑不应安装本插件。

## 3. 代码结构

| 路径 | 作用 |
|---|---|
| `package.json` | 插件元数据、版本和 DSH client 注入 |
| `cordis.patch.yml` | DSH bundle 接入 |
| `lib/index.js` | Host 入口，启动企业中枢 |
| `lib/enterprise-hub.mjs` | HTTP API、鉴权、SQLite、终端和指令状态机 |
| `lib/client.js` | 企业管理页面自注册 bundle |
| `scripts/hub-runner.mjs` | 不启动 DSH UI、单独运行中枢的测试入口 |
| `scripts/test-hub.mjs` | 中枢接口、安全和持久化回归 |

## 4. 数据库

默认路径：

```text
<KAIWU_ENTERPRISE_DATA_DIR>/enterprise.db
```

未显式设置时，数据目录取当前 `DSH_HOME/.kaiwu-enterprise/`。SQLite 开启 WAL。核心表：

| 表 | 内容 |
|---|---|
| `terminals` | 终端 ID、token 摘要、名称、主机、版本、地址、员工/能力快照、会话数、最后心跳 |
| `enrollment_codes` | 注册码摘要、标签、有效期、最大使用次数和已使用次数 |
| `commands` | 批次、目标终端/员工、payload、状态、尝试次数、结果、时间戳和过期时间 |
| `audit` | 管理动作、对象、详情、结果和关联批次 |

注册码和终端 token 只保存摘要，不应把明文写入数据库或日志。备份时应同时考虑 `enterprise.db`、`enterprise.db-wal` 和 `enterprise.db-shm`；最稳妥方式是先正常停止中枢，再复制整个数据目录。

## 5. 鉴权与网络边界

三类访问：

- `/api/health`：健康检查，不要求管理员令牌；
- 管理 API：`Authorization: Bearer <管理员令牌>`；
- 员工终端 API：注册后签发的独立终端 token。

安全门槛：当中枢监听非回环地址时，如果管理员令牌仍是默认值，服务应拒绝启动。正式或公司内网测试必须设置高强度随机 `KAIWU_ENTERPRISE_ADMIN_TOKEN`。

当前传输协议是 HTTP。可以在可信公司局域网、公司 VPN 或零信任虚拟网络内使用；不能直接暴露公网。公网化必须增加 HTTPS 终止、访问控制、限流、监控和备份。

## 6. API 与状态机

主要 API：

| 方法与路径 | 用途 |
|---|---|
| `GET /api/health` | 版本、企业名和主机健康检查 |
| `GET /api/state` | 管理端总览数据 |
| `GET /api/admin/enrollment-codes` | 查询注册码 |
| `POST /api/admin/enrollment-codes` | 生成有限期、有限次数注册码 |
| `POST /api/enroll` | 员工端首次注册 |
| `POST /api/terminal/heartbeat` | 心跳、资产上报和待执行命令领取 |
| `POST /api/terminal/commands/:id/start` | 报告开始执行 |
| `POST /api/terminal/commands/:id/ack` | 报告成功或失败 |
| `POST /api/batch` | 为多个终端生成配置命令并写审计 |

命令状态：

```text
queued -> delivered -> running -> succeeded | failed
```

终端离线时命令保留在 SQLite；默认命令有效期为 7 天。心跳恢复后重新领取。员工端负责本地幂等，企业端根据回执更新命令和批次审计结果。

## 7. 中央部署配置

建议显式设置：

```powershell
$env:KAIWU_ENTERPRISE_HUB_HOST = '<企业中枢的内网或VPN地址>'
$env:KAIWU_ENTERPRISE_LOCAL_HOST = '127.0.0.1'
$env:KAIWU_ENTERPRISE_HUB_PORT = '3099'
$env:KAIWU_ENTERPRISE_ADMIN_TOKEN = '<高强度随机令牌>'
$env:KAIWU_ENTERPRISE_NAME = '<企业名称>'
$env:KAIWU_ENTERPRISE_DATA_DIR = '<持久化数据目录>'
dsh web --profile <enterprise-profile> --port 3182
```

`0.2.1` 会同时监听指定地址和 `127.0.0.1`：

- 员工端填写 `http://<指定地址>:3099`；
- 本机企业管理页面填写 `http://127.0.0.1:3099`；
- 不建议使用 `0.0.0.0`，应绑定实际内网/VPN IP；
- Windows 防火墙只允许需要的公司网段或虚拟网卡访问 `3099/TCP`。

`KAIWU_ENTERPRISE_ALLOWED_ORIGINS` 只在从另一台电脑直接打开企业管理网页时需要，应填写精确 Origin，不要使用通配开放。

## 8. 管理页面

前端包含：总览、终端、数字员工、能力库、批量配置、审计、接入管理。

页面每 3 秒刷新一次 `/api/state`。管理员令牌只用于浏览器到中枢的管理请求。未正确鉴权时页面自动进入“接入管理”，避免显示全零总览造成误判。顶栏“使用引导”说明地址、令牌和零终端排查。

## 9. 测试

最低回归：

```powershell
node --check lib/client.js
node --check lib/enterprise-hub.mjs
node scripts/test-hub.mjs
npm pack --dry-run
```

还必须使用一个企业端和至少两个独立 `DSH_HOME` 的员工端验证：注册、心跳、在线下发、离线排队、幂等回执、中枢重启和数据清理。

已完成的最高级别验收是第三轮公司内网多终端测试，第二轮另覆盖了跨地点 Tailscale 双机。报告位于员工端仓库：

```text
测试报告/P2-跨设备基础版第二轮/第二轮跨设备实机测试验收报告.md
测试报告/P3-公司内网多终端测试/第三轮公司内网多终端实机测试验收报告.md
```

## 10. 本地辅助脚本

当前工作区存在：

- `.round2-start.ps1`
- `.round3-lan-start.ps1`
- `.round3-enable-lan-firewall.cmd`

它们是特定电脑和测试轮次的辅助脚本，不是通用产品入口，其中包含本机路径、IP 或运行假设。发布前应：

1. 检查是否含明文令牌或注册码；
2. 将可复用部分参数化后移入 `scripts/`，或保持不跟踪；
3. 不要把本机专用防火墙规则当成所有公司的默认规则。

## 11. 已知限制

- 单管理员令牌，无账号体系和 RBAC。
- 没有终端吊销、终端 token 轮换和注册码手动失效 UI。
- 没有命令详情、人工重试、取消和失败诊断页面。
- HTTP 原生服务不适合直接公网开放。
- 没有自动数据库备份、迁移版本表、监控和告警。
- 能力统计是员工端上报快照，不是中心化内容存储。
- `client.js` 是手写自注册 bundle，依赖 DSH 前端兼容性。

## 12. 发布与移交 Checklist

1. `v0.2.1` 已完成源码审查、测试、提交、推送和标签发布。
2. 三个 `.round*` 文件包含本机/轮次假设，保持忽略且未提交。
3. 仓库转移前，从空白 DSH profile 使用 GitHub `v0.2.1` 标签再安装一次。
4. 转移后更新 README 安装 URL、Git remote 和员工端交接文档。
