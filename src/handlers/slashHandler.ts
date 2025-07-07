import { readdir, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { Client } from 'discord.js' // Importamos el tipo Client de discord.js

const __filename = fileURLToPath(new URL(import.meta.url))
const __dirname = dirname(__filename)

// Definimos que el client debe tener un slashCommands: Map<string, any>
interface ExtendedClient extends Client {
  slashCommands: Map<string, any>;
}

export async function loadSlash(client: ExtendedClient): Promise<void> {
  const slashCommands = join(__dirname, '..', 'events', 'slashCommands')
  await scanDirectoryForCommands(slashCommands, client)
}

async function scanDirectoryForCommands(directory: string, client: ExtendedClient): Promise<void> {
  const items = await readdir(directory)

  for (const item of items) {
    const itemPath = join(directory, item)
    const stats = await stat(itemPath)

    if (stats.isDirectory()) {
      // Recursivamente escanear subcarpetas
      await scanDirectoryForCommands(itemPath, client)
      continue
    }

    // Solo procesar archivos .js o .mjs
    if (!item.endsWith('.ts')) {
      continue
    }

    try {
      const commandPath = pathToFileURL(itemPath).href
      const command = await import(commandPath)

      if (!command.default || !command.default.data || !command.default.data.name) {
        console.warn(`⚠️ El archivo ${item} no tiene una propiedad 'data.name'. Se omitirá.`)
        continue
      }

      client.slashCommands.set(command.default.data.name, command.default)
      console.log(`🔵 (/) Comando cargado: ${command.default.data.name}`)
    } catch (error) {
      console.error(`❌ Error al cargar el comando ${item}:`, (error as Error).message)
    }
  }
}
