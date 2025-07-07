/**
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

// Variables para el manejo de rutas (ES modules)
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
process.loadEnvFile?.();
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;

/**
 * Interfaz que extiende el Client de Discord con propiedades personalizadas
 */
interface ExtendedClient extends Client {
  color: string;
  commands: Collection<string, any>;
  slashCommands: Collection<string, any>;
  buttons: Collection<string, any>;
  services: Record<string, any>;
}

// 📌 Crear el cliente de Discord
const client = new Client({
  intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
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
}) as ExtendedClient;

// 📌 Inicializar propiedades personalizadas
client.color = '#00ace2';
client.commands = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.services = {};

// 📌 Manejo de interacciones
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const args: string[] = [];
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
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
        ephemeral: true,
        allowedMentions: { parse: ['users', 'roles', 'everyone'] },
      });
    }
  }
});

// 📌 Iniciar el bot
(async () => {
  try {
    await client.login(DISCORD_BOT_TOKEN);
    console.log(`✅ Iniciado como ${client.user?.tag}!`.green);
  } catch (error) {
    console.error(`❌ Error al iniciar el bot: ${error}`.red);
    process.exit(1);
  }
})();

// 📌 Cargar servicios
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


// Inicializar REST
const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);

// 📌 Evento 'ready'
client.on('ready', async () => {
  try {
    await loadSlash(client);
    console.log('✅ Comandos cargados correctamente'.green);
    console.log(`📜 (/) Comandos cargados: ${client.slashCommands.size}`.blue);

    client.slashCommands.forEach((cmd) => {
      console.log(`🔹 /${cmd.data.name}`);
    });

    console.log('🔄 Registrando comandos en Discord...'.blue);
    const commands = client.slashCommands.map(cmd => cmd.data);
    // Registrar los comandos globalmente en Discord
    await rest.put(Routes.applicationCommands(client.user?.id!), { body: commands });
    console.log(`✅ Se han registrado ${client.slashCommands.size} comandos globalmente.`.green);

    console.log('🔄 Registrando botones'.cyan);
    await loadButtons(client);
    console.log(`✅ Se han cargado ${client.buttons.size} botones`.green);

    await loadServices();
    console.log('✅ Servicios cargados correctamente'.green);
  } catch (error) {
    console.error('❌ Error durante la inicialización:'.red, error);
    stateError(client);
  }
});
