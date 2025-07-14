var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importaciones
import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { DaiPoll } from './DaiPoll.ts';
// Variables Globales
const activePolls = new Map(); // Mapa para almacenar las votaciones activas
export default {
    data: new SlashCommandBuilder()
        .setName('dai_votacion')
        .setDescription('Crea una votación de tiempo limitado.'),
    // Execute
    execute(interaction, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            // MARK: Crear el Modal
            const modal = new ModalBuilder()
                .setCustomId('votacion_modal')
                .setTitle('Nueva votación');
            // MARK: Inputs del Modal
            const titlePollInput = new TextInputBuilder()
                .setCustomId('title_poll_input')
                .setLabel('🔠 Título de la votación')
                .setPlaceholder('Ingresa el título de la votación.')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100)
                .setRequired(true);
            const durationPollInput = new TextInputBuilder()
                .setCustomId('duration_poll_input')
                .setLabel('⌛ Duración de la votación')
                .setMaxLength(5)
                .setPlaceholder('Ingresa la duración de la votación en segundos.')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const secretPollInput = new TextInputBuilder()
                .setCustomId('secret_poll_input')
                .setLabel('🔒 ¿Es una votación secreta?')
                .setPlaceholder('𝗣𝗼𝗿 𝗱𝗲𝗳𝗲𝗰𝘁𝗼: Y - Opciones: Y/N')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(1)
                .setRequired(false);
            const optionsInput = new TextInputBuilder()
                .setCustomId('poll_options_input')
                .setLabel('🗳️ Opciones')
                .setPlaceholder('𝗣𝗼𝗿 𝗱𝗲𝗳𝗲𝗰𝘁𝗼: A favor, En contra, Abstención')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(200)
                .setRequired(false);
            // Filas del Modal
            const titlePollRow = new ActionRowBuilder().addComponents(titlePollInput);
            const durationPollInputRow = new ActionRowBuilder().addComponents(durationPollInput);
            const secretPollInputRow = new ActionRowBuilder().addComponents(secretPollInput);
            const optionsInputRow = new ActionRowBuilder().addComponents(optionsInput);
            modal.addComponents(titlePollRow, durationPollInputRow, secretPollInputRow, optionsInputRow);
            // Mostrar el Modal
            try {
                yield interaction.showModal(modal);
            }
            catch (error) {
                console.error('Modal interaction error:', error);
                return;
            }
            // MARK: Respuesta del Modal
            try {
                const modalSubmit = yield interaction.awaitModalSubmit({
                    time: 300000, // 5 minutos
                    filter: (i) => i.customId === 'votacion_modal' && i.user.id === interaction.user.id
                });
                // Obtener Valores del Modal
                const titlePollInputValue = modalSubmit.fields.getTextInputValue('title_poll_input');
                const durationPollInputValue = modalSubmit.fields.getTextInputValue('duration_poll_input');
                const secretPollInputValue = modalSubmit.fields.getTextInputValue('secret_poll_input').toUpperCase();
                const optionsInputValue = modalSubmit.fields.getTextInputValue('poll_options_input');
                yield modalSubmit.deferReply();
                // Validar Duración
                const durationInSeconds = parseInt(durationPollInputValue);
                if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
                    yield modalSubmit.reply({
                        content: '<:no:1288631410558767156> La duración debe ser un número positivo de segundos.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                // Validar Opción Secreta
                if (secretPollInputValue !== 'Y' && secretPollInputValue !== 'N' && secretPollInputValue !== '') {
                    yield modalSubmit.reply({
                        content: '<:no:1288631410558767156> La opción secreta debe ser Y o N.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                // MARK: Crear la Votación
                const pollId = Date.now().toString(); // ID único para la votación
                const poll = new DaiPoll(titlePollInputValue, `${modalSubmit.user}`, modalSubmit.channel, `${optionsInputValue}` === '' ? 'A favor, En contra, Abstención' : optionsInputValue, `${secretPollInputValue}` === '' ? 'Y' : secretPollInputValue, durationInSeconds);
                activePolls.set(pollId, poll); // Almacenar la votación en el mapa
                // MARK: Crear Botones
                const createButtons = (disabled = false) => {
                    return poll.options.map((option) => {
                        let style = ButtonStyle.Primary; // Por defecto, azul
                        if (option === 'A favor') {
                            style = ButtonStyle.Success; // Verde
                        }
                        else if (option === 'En contra') {
                            style = ButtonStyle.Danger; // Rojo
                        }
                        return new ButtonBuilder()
                            .setCustomId(`vote_${option}_${pollId}`) // Usar el ID único de la votación
                            .setLabel(option)
                            .setStyle(style)
                            .setDisabled(disabled || !poll.status);
                    });
                };
                const buttonRow = new ActionRowBuilder().addComponents(createButtons());
                // MARK: Enviar el Embed Inicial
                const initialEmbed = yield poll.embedPoll();
                const message = yield modalSubmit.editReply({ embeds: [initialEmbed], components: [buttonRow] });
                // Variables para Control de Actualizaciones
                const processingVotes = new Map();
                let updateIntervalTime = 1000; // Por defecto 1 segundo
                let updateTimerId = null;
                // MARK: Crear Collector para Manejar Votos
                const collector = message.createMessageComponentCollector({
                    filter: (i) => i.customId.endsWith(`_${pollId}`) && poll.status,
                    time: durationInSeconds * 1000
                });
                collector.on('collect', (buttonInteraction) => __awaiter(this, void 0, void 0, function* () {
                    if (processingVotes.has(buttonInteraction.user.id)) {
                        yield buttonInteraction.reply({
                            content: '⏳ Por favor espera, tu voto anterior está siendo procesado.',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }
                    processingVotes.set(buttonInteraction.user.id, true);
                    try {
                        yield buttonInteraction.deferUpdate();
                        const [action, option] = buttonInteraction.customId.split('_');
                        if (action === 'vote') {
                            yield poll.newVote(buttonInteraction, option);
                            // Actualizar el intervalo basado en cuántas votaciones activas hay
                            updateIntervalTime = activePolls.size > 1 ? 3000 : 1000;
                        }
                    }
                    catch (error) {
                        console.error('Error al procesar el voto:', error);
                        yield buttonInteraction.followUp({
                            content: '<:no:1288631410558767156> Hubo un error al procesar tu voto.',
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    finally {
                        processingVotes.delete(buttonInteraction.user.id);
                    }
                }));
                // MARK: Finalizar la Votación
                collector.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        poll.status = false;
                        const disabledButtonRow = new ActionRowBuilder().addComponents(createButtons(true));
                        const finalEmbed = yield poll.embedPoll();
                        yield message.edit({ embeds: [finalEmbed], components: [disabledButtonRow] });
                        // Eliminar la votación del mapa de votaciones activas
                        activePolls.delete(pollId);
                        // Enviar resultados privados
                        const secretUsers = ['789591730907381760', '843805925612847115'];
                        yield poll.sendPrivateResults(client, secretUsers);
                    }
                    catch (error) {
                        console.error('Error al finalizar la votación:', error);
                    }
                }));
                // MARK: Actualizar el Embed Periódicamente con Intervalo Simplificado
                const updatePoll = () => __awaiter(this, void 0, void 0, function* () {
                    if (!poll.status)
                        return;
                    try {
                        const updatedEmbed = yield poll.embedPoll();
                        yield message.edit({ embeds: [updatedEmbed], components: [buttonRow] });
                        // Comprobar cuántas votaciones hay activas y ajustar el tiempo
                        updateIntervalTime = activePolls.size > 1 ? 3000 : 1000;
                        // Programar la siguiente actualización
                        updateTimerId = setTimeout(updatePoll, updateIntervalTime);
                    }
                    catch (error) {
                        console.error('Error actualizando la votación:', error);
                    }
                });
                // Iniciar la primera actualización
                updateTimerId = setTimeout(updatePoll, updateIntervalTime);
                // MARK: Finalizar la Votación Después del Tiempo Indicado
                setTimeout(() => {
                    poll.status = false;
                    if (updateTimerId) {
                        clearTimeout(updateTimerId);
                    }
                }, durationInSeconds * 1000);
            }
            catch (error) {
                console.error('Error en la interacción del modal:', error);
            }
        });
    }
};
