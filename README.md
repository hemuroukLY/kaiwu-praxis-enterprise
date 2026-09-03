# kaiwu-praxis-enterprise

开物 Praxis 企业管理端 DSH 插件。它与员工端 `kaiwu-praxis` 独立安装和升级。

基础版提供总览、终端、数字员工、能力库、批量配置和审计。本机中枢只监听
`127.0.0.1:3099`；员工端通过该地址上报配置资产和会话计数，并拉取配置指令。

企业端不包含数字员工预设、员工设置或员工工具。员工端没有安装企业端时仍可独立使用。

## 安装

```bash
dsh plugin --profile <profile> add git+https://github.com/motang1219/kaiwu-praxis-enterprise.git
dsh web --profile <profile> --port 3082
```

作为企业终端接入的 DSH 实例应另外安装员工端及便携交付包约定的三个配套插件：

```bash
dsh plugin --profile <profile> add git+https://github.com/motang1219/kaiwu-praxis.git
dsh plugin --profile <profile> add @nanmicoder/dsh-agent-teams@0.1.14
dsh plugin --profile <profile> add @vectorize-io/hindsight-coding-agents@0.4.3
dsh plugin --profile <profile> add dsh-better-sidebar@0.17.1
```
