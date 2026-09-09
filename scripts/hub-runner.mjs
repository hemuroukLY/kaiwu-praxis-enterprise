import { ensureEnterpriseHub } from '../lib/enterprise-hub.mjs'

const hub = await ensureEnterpriseHub(console)

async function close() {
  await Promise.all((hub.servers || [hub.server]).map((server) => new Promise((resolve) => server.close(resolve))))
  hub.database.close()
  process.exit(0)
}

process.on('SIGTERM', close)
process.on('SIGINT', close)
console.log(`READY ${hub.url}`)
