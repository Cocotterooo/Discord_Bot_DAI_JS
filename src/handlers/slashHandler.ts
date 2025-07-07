import { readdir, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { Client } from 'discord.js'

// Variables para el manejo de rutas
const __filename = fileURLToPath(new URL(import.meta.url))
const __dirname = dirname(__filename)

/**
 * Extensión del Client para incluir slashCommands
 */
interface ExtendedClient extends Client {
  slashCommands: Map<string, any>;
}

/**
 * Carga todos los slash commands desde el directorio de eventos
 * @param client Cliente extendido de Discord
 */
export async function loadSlash(client: ExtendedClient): Promise<void> {
  const slashCommandsPath = join(__dirname, '..', 'events', 'slashCommands')
  
  console.log(`⚡ Cargando slash commands desde: ${slashCommandsPath}`)
  
  await scanDirectoryForCommands(slashCommandsPath, client)
  
  console.log(`✅ Cargados ${client.slashCommands.size} slash commands`)
}

/**
 * Escanea recursivamente un directorio en busca de comandos
 * @param directory Directorio a escanear
 * @param client Cliente extendido
 */
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

    // Procesar solo archivos .js (compilados)
    if (item.endsWith('.js')) {
      await loadSlashCommand(itemPath, client)
    }
  }
}

/**
 * Carga un comando slash específico
 * @param filePath Ruta del archivo
 * @param client Cliente extendido
 */
async function loadSlashCommand(filePath: string, client: ExtendedClient): Promise<void> {
  try {
    const fileURL = pathToFileURL(filePath).href
    const commandModule = await import(fileURL)
    const command = commandModule.default || commandModule

    // Validar estructura del comando
    if (!command || !command.data || !command.data.name) {
      console.warn(`⚠️ Comando inválido en ${filePath}: falta 'data.name'`)
      return
    }

    // Registrar el comando
    client.slashCommands.set(command.data.name, command)
    console.log(`� Comando cargado: /${command.data.name}`)
  } catch (error) {
    console.error(`❌ Error cargando comando ${filePath}:`, error)
  }
}
