// kaiwu-praxis-enterprise host 插件：启动本机企业中枢。
import { ensureEnterpriseHub } from './enterprise-hub.mjs'

export const name = 'kaiwu-praxis-enterprise'

export function apply(ctx) {
  ensureEnterpriseHub(ctx.logger).catch((error) => {
    ctx.logger?.warn(`kaiwu-praxis-enterprise: hub start failed: ${(error && error.message) || error}`)
  })
}
