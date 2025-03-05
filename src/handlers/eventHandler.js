import { readdirSync } from 'fs'
import { join } from 'path'

export async function loadEvents (client) {
  const eventsPath = join(process.cwd(), 'src/events')
  const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'))

  for (const file of eventFiles) {
    import(`../events/${file}`).then(event => {
      if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args, client))
      } else {
        client.on(event.default.name, (...args) => event.default.execute(...args, client))
      }
    })
  }
}
