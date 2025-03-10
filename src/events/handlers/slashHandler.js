import { readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadSlash (client) {
  const slashCommands = join(__dirname, '..', 'slashCommands')
  const folders = await readdir(slashCommands)

  for (const folder of folders) {
    const commandFiles = await readdir(join(slashCommands, folder))

    for (const file of commandFiles) {
      try {
        // Convertir la ruta a una URL válida para ESM
        const commandPath = pathToFileURL(join(slashCommands, folder, file)).href
        const command = await import(commandPath)

        // Validar que el comando tenga 'data' y un nombre
        if (!command.default || !command.default.data || !command.default.data.name) {
          console.warn(`⚠️ El archivo ${file} no tiene una propiedad 'data.name'. Se omitirá.`)
          continue
        }

        // Agregar el comando a la colección
        client.slashCommands.set(command.default.data.name, command.default)
        console.log(`🔵 (/) Comando cargado: ${command.default.data.name}`.blue)
      } catch (error) {
        console.error(`❌ Error al cargar el comando ${file}:`, error)
      }
    }
  }
}
