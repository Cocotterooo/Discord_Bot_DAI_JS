import { readdir, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadSlash (client) {
  const slashCommands = join(__dirname, '..', 'slashCommands')
  await scanDirectoryForCommands(slashCommands, client)
}

async function scanDirectoryForCommands (directory, client) {
  const items = await readdir(directory)

  for (const item of items) {
    const itemPath = join(directory, item)
    const stats = await stat(itemPath)

    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      await scanDirectoryForCommands(itemPath, client)
      continue
    }

    // Only process JavaScript files
    if (!item.endsWith('.js') && !item.endsWith('.mjs')) {
      continue
    }

    try {
      // Convert path to a valid URL for ESM
      const commandPath = pathToFileURL(itemPath).href
      const command = await import(commandPath)

      // Validate command has 'data' and a name
      if (!command.default || !command.default.data || !command.default.data.name) {
        console.warn(`⚠️ El archivo ${item} no tiene una propiedad 'data.name'. Se omitirá.`)
        continue
      }

      // Add command to collection
      client.slashCommands.set(command.default.data.name, command.default)
      console.log(`🔵 (/) Comando cargado: ${command.default.data.name}`)
    } catch (error) {
      console.error(`❌ Error al cargar el comando ${item}:`, error)
    }
  }
}
