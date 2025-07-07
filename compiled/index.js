var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { Client, GatewayIntentBits, PresenceUpdateStatus, Partials, Collection, ActivityType, } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { discordConfig } from './config.ts';
import 'colors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// 📌 Importar funciones de manejo de errores
import { stateError } from './src/utilities/stateError.ts';
// 📌 Importar handlers para Slash Commands, eventos y botones
import { loadSlash } from './src/handlers/slashHandler.ts';
import { loadButtons } from './src/handlers/buttonHandler.ts';
// 📌 Variables necesarias para rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 📌 Cargar variables de entorno
(_a = process.loadEnvFile) === null || _a === void 0 ? void 0 : _a.call(process);
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const INSTAGRAM_API_KEY = process.env.INSTAGRAM_API_KEY;
// 📌 Crear el cliente de Discord
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
// 📌 Inicializar propiedades personalizadas
client.color = '#00ace2';
client.commands = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.services = {};
// 📌 Manejo de interacciones
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!interaction.isChatInputCommand())
        return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command)
        return;
    const args = [];
    for (const option of interaction.options.data) {
        if (option.type === 1) { // Subcomandos
            if (option.name)
                args.push(option.name);
            (_a = option.options) === null || _a === void 0 ? void 0 : _a.forEach(subOption => {
                if (subOption.value)
                    args.push(String(subOption.value));
            });
        }
        else if (option.value) {
            args.push(String(option.value));
        }
    }
    try {
        yield command.execute(interaction, client, args);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            yield interaction.followUp({
                content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
                ephemeral: true,
            });
        }
        else {
            yield interaction.reply({
                content: '<:no:1288631410558767156> Hubo un error al ejecutar el comando',
                ephemeral: true,
                allowedMentions: { parse: ['users', 'roles', 'everyone'] },
            });
        }
    }
}));
// 📌 Iniciar el bot
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield client.login(DISCORD_BOT_TOKEN);
        console.log(`✅ Iniciado como ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`.green);
    }
    catch (error) {
        console.error(`❌ Error al iniciar el bot: ${error}`.red);
        process.exit(1);
    }
}))();
// 📌 Cargar servicios
function loadServices() {
    return __awaiter(this, void 0, void 0, function* () {
        const servicesPath = path.join(__dirname, 'src', 'services');
        try {
            if (fs.existsSync(servicesPath)) {
                const servicesFolders = fs.readdirSync(servicesPath);
                for (const folder of servicesFolders) {
                    const folderPath = path.join(servicesPath, folder);
                    if (fs.statSync(folderPath).isDirectory()) {
                        const servicePath = path.join(folderPath, `${folder.toLowerCase()}.js`);
                        if (fs.existsSync(servicePath)) {
                            const serviceModule = yield import(`file://${servicePath}`);
                            const service = serviceModule.default(client);
                            const serviceName = folder.charAt(0).toLowerCase() + folder.slice(1);
                            client.services[serviceName] = service;
                            console.log(`Servicio cargado: ${serviceName}`);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    });
}
// Inicializar REST
const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);
// 📌 Evento 'ready'
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield loadSlash(client);
        console.log('✅ Comandos cargados correctamente'.green);
        console.log(`📜 (/) Comandos cargados: ${client.slashCommands.size}`.blue);
        client.slashCommands.forEach((cmd) => {
            console.log(`🔹 /${cmd.data.name}`);
        });
        console.log('🔄 Registrando comandos en Discord...'.blue);
        const commands = client.slashCommands.map(cmd => cmd.data);
        // Registrar los comandos globalmente en Discord
        yield rest.put(Routes.applicationCommands((_a = client.user) === null || _a === void 0 ? void 0 : _a.id), { body: commands });
        console.log(`✅ Se han registrado ${client.slashCommands.size} comandos globalmente.`.green);
        console.log('🔄 Registrando botones'.cyan);
        yield loadButtons(client);
        console.log(`✅ Se han cargado ${client.buttons.size} botones`.green);
        yield loadServices();
        console.log('✅ Servicios cargados correctamente'.green);
    }
    catch (error) {
        console.error('❌ Error durante la inicialización:'.red, error);
        stateError(client);
    }
}));
