# kaiwu-praxis-enterprise

开物 Praxis 企业管理端 DSH 插件。它与员工端 `kaiwu-praxis` 独立安装和升级。

跨设备基础版提供总览、**员工档案**、终端、数字员工、能力库、批量配置、审计和接入管理。企业中枢使用 SQLite 持久化终端、注册码、指令状态、审计与数字员工档案；员工端主动上报配置资产和会话计数并拉取配置指令，不需要开放入站端口。

企业端不包含数字员工预设、员工本地工具。员工档案在企业端编辑，经 `updateProfile` 下发到员工端物化；员工端「员工设置 → 员工档案」只读。员工端没有安装企业端时仍可独立使用。

## 安装

```bash
dsh plugin --profile <profile> add git+https://github.com/hemuroukLY/kaiwu-praxis-enterprise.git#v0.2.2
dsh web --profile <profile> --port 3082
```

## 中央部署

默认只监听 `127.0.0.1:3099`，用于本机开发。公司内网部署时至少设置监听地址、管理员令牌和企业名称：

```bash
KAIWU_ENTERPRISE_HUB_HOST=<企业中枢的内网或VPN地址>
KAIWU_ENTERPRISE_LOCAL_HOST=127.0.0.1
KAIWU_ENTERPRISE_HUB_PORT=3099
KAIWU_ENTERPRISE_ADMIN_TOKEN=<高强度随机令牌>
KAIWU_ENTERPRISE_NAME=<企业名称>
dsh web --profile <profile> --port 3082
```

可选配置：

- `KAIWU_ENTERPRISE_DATA_DIR`：SQLite 数据目录，默认位于当前 `DSH_HOME/.kaiwu-enterprise/`。
- `KAIWU_ENTERPRISE_ENROLLMENT_CODE`：预置测试注册码；正式环境建议在「接入管理」按需生成一次性注册码。
- `KAIWU_ENTERPRISE_ALLOWED_ORIGINS`：额外允许访问中枢 API 的浏览器 Origin，以英文逗号分隔。
- `KAIWU_ENTERPRISE_LOCAL_HOST`：中央部署时额外提供给本机管理页面使用的回环监听地址，默认 `127.0.0.1`。

当 `KAIWU_ENTERPRISE_HUB_HOST` 设置为内网或 Tailscale 地址时，中枢会同时监听该地址和 `127.0.0.1`：员工端连接内网地址，本机企业管理页面填写 `http://127.0.0.1:3099`。这样可避免浏览器或系统代理拦截本机管理请求，同时不会监听其他公司局域网网卡。

企业管理页面首次进入「接入管理」，填写本机中枢地址和管理员令牌。未鉴权的浏览器会自动进入接入管理，不再显示容易误解的空总览；顶栏“使用引导”包含完整接入步骤和总览显示 0 时的排查说明。管理员接口必须使用 Bearer 令牌；员工端注册后取得独立终端令牌。注册码只保存摘要并受有效期、最大使用次数限制。

不要把当前 HTTP 端口直接暴露到公网。跨办公地点接入建议先使用公司 VPN/零信任网络；需要公网服务时，应在前置网关终止 HTTPS，并配置防火墙、访问控制和备份。

作为企业终端接入的 DSH 实例应另外安装员工端及便携交付包约定的三个配套插件：

```bash
dsh plugin --profile <profile> add git+https://github.com/hemuroukLY/kaiwu-praxis.git
dsh plugin --profile <profile> add @nanmicoder/dsh-agent-teams@0.1.14
dsh plugin --profile <profile> add @vectorize-io/hindsight-coding-agents@0.4.3
dsh plugin --profile <profile> add dsh-better-sidebar@0.17.1
```

员工端安装完成后，在「员工设置 → 企业连接」填写 `http://<企业中枢内网地址>:3099` 和企业管理端生成的注册码。终端成功注册后会清除 settings 中的注册码，持久终端密钥仅保存在员工端宿主目录。

## 开发交接

当前 GitHub 基线为 `v0.2.1`。接手前请先阅读 [`HANDOFF.md`](./HANDOFF.md)，并确认 `main` 与该标签均可获取。
