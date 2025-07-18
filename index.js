/** MARK: DISCORD BOT EEI
 * Discord Bot DAI - Bot oficial de la Delegación de Alumnos de Industriales
 * Universidad de Vigo
 *
 * Este bot gestiona usuarios, actividades, canales, votaciones y más
 * para la comunidad de discord de la Escuela de Industriales de la UVigo.
 */

import {
  Client,
  GatewayIntentBits,
  PresenceUpdateStatus,
  Partials,
  Collection,
  ActivityType,
  MessageFlags
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { discordConfig } from './config.js';
import 'colors';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar funciones utilitarias
import { stateError } from './src/utilities/stateError.js';

// Importar handlers para la gestión de comandos y eventos
import { loadSlash } from './src/handlers/slashHandler.js';
import { loadButtons } from './src/handlers/buttonHandler.js';
import { loadEvents } from './src/handlers/eventHandler.js';

// Variables para el manejo de rutas (ES modules)
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
process.loadEnvFile?.();
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// MARK: 📌 Crear el cliente de Discord
const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: [
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  presence: {
    status: PresenceUpdateStatus.Idle,
    activities: [
      {
        name: discordConfig.activities.state || 'EEI - UVigo',
        type: ActivityType.Custom,
      },
    ],
  },
  allowedMentions: {
    parse: ['users', 'roles', 'everyone'],
    repliedUser: true,
  },
});

// MARK: 📌 Inicializar propiedades personalizadas
client.color = '#00ace2';
client.commands = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.services = {};

// MARK: 📌 Manejo de interacciones
client.on('interactionCreate', async (interaction) => {
  // Manejar comandos slash
  if (interaction.isChatInputCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    const args = [];
    for (const option of interaction.options.data) {
      if (option.type === 1) { // Subcomandos
        if (option.name) args.push(option.name);
        option.options?.forEach(subOption => {
          if (subOption.value) args.push(String(subOption.value));
        });
      } else if (option.value) {
        args.push(String(option.value));
      }
    }

    try {
      await command.execute(interaction, client, args);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    return;
  }

  // Manejar interacciones de componentes (botones, menús de selección, etc.)
  if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isUserSelectMenu()) {
    // Determinar qué comando maneja esta interacción basándose en el customId
    let commandName = null;

    // Mapear customIds a comandos que los manejan
    if (interaction.customId.startsWith('ins_ceeibis')) {
      commandName = 'ins_ceeibis';
    } else if (interaction.customId.startsWith('ins_vortex')) {
      commandName = 'ins_vortex';
    } else if (interaction.customId.startsWith('ins_spacelab')) {
      commandName = 'ins_spacelab';
    } else if (interaction.customId.startsWith('ins_motorsport')) {
      commandName = 'ins_motorsport';
    } else if (interaction.customId.startsWith('ins_ces')) {
      commandName = 'ins_ces';
    }

    if (commandName) {
      const command = client.slashCommands.get(commandName);
      if (command && typeof command.handleComponentInteraction === 'function') {
        try {
          await command.handleComponentInteraction(interaction, client);
        } catch (error) {
          console.error(`Error manejando componente de ${commandName}:`, error);

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: '<:no:1288631418158080000> Hubo un error al procesar la interacción.',
              flags: MessageFlags.Ephemeral
            });
          } else {
            await interaction.reply({
              content: '<:no:1288631418158080000> Hubo un error al procesar la interacción.',
              flags: MessageFlags.Ephemeral
            });
          }
        }
      }
    }
  }
});

// MARK: 📌 Iniciar el bot
(async () => {
  try {
    await client.login(DISCORD_BOT_TOKEN);
    console.log(`✅ Iniciado como ${client.user?.tag}!`.green);
  } catch (error) {
    console.error(`❌ Error al iniciar el bot: ${error}`.red);
    process.exit(1);
  }
})();

// MARK: 📌 Cargar servicios
async function loadServices() {
  const servicesPath = path.join(__dirname, 'src', 'services');

  try {
    if (fs.existsSync(servicesPath)) {
      const servicesFolders = fs.readdirSync(servicesPath);

      for (const folder of servicesFolders) {
        const folderPath = path.join(servicesPath, folder);

        if (fs.statSync(folderPath).isDirectory()) {
          const servicePath = path.join(folderPath, `${folder.toLowerCase()}.js`);

          if (fs.existsSync(servicePath)) {
            const serviceModule = await import(`file://${servicePath}`);
            const service = serviceModule.default(client);

            const serviceName = folder.charAt(0).toLowerCase() + folder.slice(1);
            client.services[serviceName] = service;
            console.log(`Servicio cargado: ${serviceName}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error);
  }
}

// MARK: Inicializar REST
const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);

// 📌 Evento 'ready'
client.on('ready', async () => {
  try {
    // Cargar eventos primero
    console.log('🔄 Cargando eventos...'.blue);
    await loadEvents(client);
    console.log('✅ Eventos cargados correctamente'.green);

    await loadSlash(client);
    console.log('✅ Comandos cargados correctamente'.green);
    console.log(`📜 (/) Comandos cargados: ${client.slashCommands.size}`.blue);

    client.slashCommands.forEach((cmd) => {
      console.log(`🔹 /${cmd.data.name}`);
    });

    console.log('🔄 Registrando comandos en Discord...'.blue);
    const commands = client.slashCommands.map(cmd => cmd.data);
    // Registrar los comandos globalmente en Discord
    await rest.put(Routes.applicationCommands(client.user?.id), { body: commands });
    console.log(`✅ Se han registrado ${client.slashCommands.size} comandos globalmente.`.green);

    console.log('🔄 Registrando botones'.cyan);
    await loadButtons(client);
    console.log(`✅ Se han cargado ${client.buttons.size} botones`.green);

    await loadServices();
    console.log('✅ Servicios cargados correctamente'.green);

    // Limpiar canales de voz personalizados existentes
    console.log('🔄 Limpiando canales de voz personalizados...'.blue);
    const { cleanupExistingChannels } = await import('./src/events/buttons/canales_voz/voiceChannelHandler.js');
    await cleanupExistingChannels(client);
    console.log('✅ Limpieza de canales completada'.green);
  } catch (error) {
    console.error('❌ Error durante la inicialización:'.red, error);
    stateError(client);
  }
});
