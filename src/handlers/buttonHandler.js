import { readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadButtons (client) {
  const buttonsPath = join(__dirname, '..', 'events', 'buttons')
  const folders = await readdir(buttonsPath)

  // Inicializar colección de botones si no existe
  client.buttons = client.buttons || new Map()

  for (const folder of folders) {
    const buttonFiles = await readdir(join(buttonsPath, folder))

    for (const file of buttonFiles) {
      try {
        // Convertir la ruta a una URL válida para ESM
        const buttonPath = pathToFileURL(join(buttonsPath, folder, file)).href
        const button = await import(buttonPath)

        // Validar que el botón tenga 'id'
        if (!button.default || !button.default.id) {
          console.warn(`⚠️ El archivo ${file} no tiene una propiedad 'id'. Se omitirá.`)
          continue
        }

        // Agregar el botón a la colección
        client.buttons.set(button.default.id, button.default)
        console.log(`🔘 Botón cargado: ${folder}/${button.default.id}`.cyan)
      } catch (error) {
        console.error(`❌ Error al cargar el botón ${file}:`, error)
      }
    }
  }

  // Configurar el event listener para manejar interacciones de botones
  if (!client.buttonHandlerInitialized) {
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return

      const button = client.buttons.get(interaction.customId)
      if (!button) return

      try {
        await button.execute(interaction, client)
      } catch (error) {
        console.error(`❌ Error al ejecutar el botón ${interaction.customId}:`, error)
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'Hubo un error al ejecutar este botón.',
            ephemeral: true
          })
        } else {
          await interaction.reply({
            content: 'Hubo un error al ejecutar este botón.',
            ephemeral: true
          })
        }
      }
    })

    client.buttonHandlerInitialized = true
    console.log('🔄 Handler de botones inicializado correctamente'.green)
  }
}
