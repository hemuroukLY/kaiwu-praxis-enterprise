import { ensureEnterpriseHub } from '../lib/enterprise-hub.mjs'

const hub = await ensureEnterpriseHub(console)

async function close() {
  await new Promise((resolve) => hub.server.close(resolve))
  hub.database.close()
  process.exit(0)
}

process.on('SIGTERM', close)
process.on('SIGINT', close)
console.log(`READY ${hub.url}`)

