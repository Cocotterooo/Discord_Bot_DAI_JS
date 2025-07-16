import { readdir, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(new URL(import.meta.url))
const __dirname = dirname(__filename)

export async function loadSlash(client) {
  const slashCommandsPath = join(__dirname, '..', 'events', 'slashCommands')

  console.log(`Cargando slash commands desde: ${slashCommandsPath}`)

  await scanDirectoryForCommands(slashCommandsPath, client)

  console.log(`Cargados ${client.slashCommands.size} slash commands`)
}

async function scanDirectoryForCommands(directory, client) {
  try {
    const items = await readdir(directory)

    for (const item of items) {
      const itemPath = join(directory, item)
      const stats = await stat(itemPath)

      if (stats.isDirectory()) {
        // Recursivamente escanear subcarpetas
        await scanDirectoryForCommands(itemPath, client)
        continue
      }

      // Procesar solo archivos .js
      if (item.endsWith('.js')) {
        await loadSlashCommand(itemPath, client)
      }
    }
  } catch (error) {
    console.warn(`Error escaneando directorio ${directory}:`, error.message)
  }
}

async function loadSlashCommand(filePath, client) {
  try {
    // Lista de archivos a ignorar (archivos de utilidad, configuración, etc.)
    const ignoredFiles = [
      'config.js',
      'reportUtils.js',
      'reunionHandlers.js',
      'reunionStore.js',
      'roleUtils.js',
      'voiceListeners.js'
    ]

    const fileName = filePath.split(/[\\/]/).pop()

    // Ignorar archivos de utilidad
    if (ignoredFiles.includes(fileName)) {
      return
    }

    const fileURL = pathToFileURL(filePath).href
    const commandModule = await import(fileURL)
    const command = commandModule.default || commandModule

    // Validar estructura del comando
    if (!command || !command.data || !command.data.name) {
      console.warn(`Comando invalido en ${filePath}: falta 'data.name'`)
      return
    }

    // Registrar el comando
    client.slashCommands.set(command.data.name, command)
    console.log(`Comando cargado: /${command.data.name}`)
  } catch (error) {
    console.error(`Error cargando comando ${filePath}:`, error)
  }
}
