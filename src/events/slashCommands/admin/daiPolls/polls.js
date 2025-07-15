// Importaciones
import {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from 'discord.js';
import { DaiPoll } from './DaiPoll.js';

// Variables Globales
const activePolls = new Map(); // Mapa para almacenar las votaciones activas
export default {
    data: new SlashCommandBuilder()
        .setName('dai_votacion')
        .setDescription('Crea una votación de tiempo limitado.'),
    // Execute
    async execute(interaction, client) {
        if (!interaction.isCommand()) {
            return;
        }
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
            const typePollInput = new TextInputBuilder()
                .setCustomId('type_poll_input')
                .setLabel('📩 Votos permitidos: CD, XA o pública')
                .setMaxLength(2)
                .setPlaceholder('𝗣𝗼𝗿 𝗱𝗲𝗳𝗲𝗰𝘁𝗼: CD - Opciones CD/XA/P')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
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
            const typePollInputRow = new ActionRowBuilder().addComponents(typePollInput);
            const secretPollInputRow = new ActionRowBuilder().addComponents(secretPollInput);
            const optionsInputRow = new ActionRowBuilder().addComponents(optionsInput);
            modal.addComponents(titlePollRow, durationPollInputRow, typePollInputRow, secretPollInputRow, optionsInputRow);

        // Mostrar el Modal
        try {
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Modal interaction error:', error);
            return;
        }

        // MARK: Respuesta del Modal
        try {
            const modalSubmit = await interaction.awaitModalSubmit({
                time: 300000, // 5 minutos
                filter: (i) => i.customId === 'votacion_modal' && i.user.id === interaction.user.id
            });

            // MARK: Obtener Valores del Modal
            const titlePollInputValue = modalSubmit.fields.getTextInputValue('title_poll_input');
            const durationPollInputValue = modalSubmit.fields.getTextInputValue('duration_poll_input');
            const typePollInputValue = modalSubmit.fields.getTextInputValue('type_poll_input').toUpperCase() || 'CD';
            const secretPollInputValue = modalSubmit.fields.getTextInputValue('secret_poll_input').toUpperCase() || 'Y';
            const optionsInputValue = modalSubmit.fields.getTextInputValue('poll_options_input');

            await modalSubmit.deferReply();

            // MARK: Validar Duración
            const durationInSeconds = parseInt(durationPollInputValue);
            if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
                await modalSubmit.editReply({
                    content: '<:no:1288631410558767156> La duración debe ser un **número positivo de segundos**.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // MARK: Validar Tipo de Votación
            if (typePollInputValue && !['CD', 'XA', 'P'].includes(typePollInputValue)) {
                await modalSubmit.editReply({
                    content: '<:no:1288631410558767156> El tipo de votación debe ser **CD** (Comisión Delegada), **XA** (Xunta de Alumnado) o **P** (pública).',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // MARK: Validar Opción Secreta
            if (secretPollInputValue && secretPollInputValue !== 'Y' && secretPollInputValue !== 'N') {
                await modalSubmit.editReply({
                    content: '<:no:1288631410558767156> La opción secreta debe ser **Y** o **N**.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // MARK: Crear la Votación
            const pollId = Date.now().toString(); // ID único para la votación
            const poll = new DaiPoll(
                titlePollInputValue,
                modalSubmit.user,
                modalSubmit.channel,
                optionsInputValue === '' ? 'A favor, En contra, Abstención' : optionsInputValue,
                typePollInputValue,
                secretPollInputValue === '' ? 'Y' : secretPollInputValue,
                durationInSeconds
            );
            activePolls.set(pollId, poll); // Almacenar la votación en el mapa

            // MARK: CREAR BOTONES
            const createButtons = (disabled = false) => {
                return poll.options.map((option) => {
                    let style = ButtonStyle.Primary; // Por defecto, azul
                    if (option === 'A favor') {
                        style = ButtonStyle.Success; // Verde
                    } else if (option === 'En contra') {
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
            const initialEmbed = await poll.embedPoll();
            const message = await modalSubmit.editReply({ embeds: [initialEmbed], components: [buttonRow] });

            // Variables para Control de Actualizaciones
            const processingVotes = new Map();
            let updateIntervalTime = 1000; // Por defecto 1 segundo
            let updateTimerId = null;

            // MARK: Crear Collector para Manejar Votos
            const collector = message.createMessageComponentCollector({
                filter: (i) => i.customId.endsWith(`_${pollId}`) && poll.status,
                time: durationInSeconds * 1000
            });

            collector.on('collect', async (buttonInteraction) => {
                if (!poll.status) {
                    await buttonInteraction.reply({
                        content: '<:no:1288631410558767156> Esta votación ya ha finalizado.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                if (processingVotes.has(buttonInteraction.user.id)) {
                    await buttonInteraction.reply({
                        content: '⏳ Por favor espera, tu voto anterior está siendo procesado.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                // MARK: PERMISOS
                const member = buttonInteraction.member;
                const cdRoleId = '1288206919118618839';
                const xaRoleId = '1339177881355550833';

                let canVote = false;
                let errorMessage = '';

                switch (poll.type) {
                    case 'CD':
                        canVote = member.roles.cache.has(cdRoleId);
                        errorMessage = '<:no:1288631410558767156> Esta votación es exclusiva para la **Comisión Delegada**. No tienes permisos para votar.';
                        break;
                    case 'XA':
                        canVote = member.roles.cache.has(cdRoleId) || member.roles.cache.has(xaRoleId);
                        errorMessage = '<:no:1288631410558767156> Esta votación es exclusiva para la **Xunta de Alumnado**. No tienes permisos para votar.';
                        break;
                    case 'P':
                        canVote = true; // Votación pública, todos pueden votar
                        break;
                    default:
                        canVote = false;
                        errorMessage = '<:no:1288631410558767156> Tipo de votación no válido.';
                }

                if (!canVote) {
                    await buttonInteraction.reply({
                        content: errorMessage,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                processingVotes.set(buttonInteraction.user.id, true);

                try {
                    await buttonInteraction.deferUpdate();
                    const [action, option] = buttonInteraction.customId.split('_');
                    if (action === 'vote') {
                        await poll.newVote(buttonInteraction, option);
                        // Actualizar el intervalo basado en cuántas votaciones activas hay
                        updateIntervalTime = activePolls.size > 1 ? 3000 : 1000;
                    }
                } catch (error) {
                    console.error('Error al procesar el voto:', error);
                    try {
                        if (!buttonInteraction.replied && !buttonInteraction.deferred) {
                            await buttonInteraction.reply({
                                content: '<:no:1288631410558767156> Hubo un error al procesar tu voto.',
                                flags: MessageFlags.Ephemeral
                            });
                        } else {
                            await buttonInteraction.followUp({
                                content: '<:no:1288631410558767156> Hubo un error al procesar tu voto.',
                                flags: MessageFlags.Ephemeral
                            });
                        }
                    } catch (replyError) {
                        console.error('Error al enviar mensaje de error del voto:', replyError);
                    }
                } finally {
                    processingVotes.delete(buttonInteraction.user.id);
                }
            });

            // MARK: Finalizar la Votación
            collector.on('end', async () => {
                try {
                    poll.status = false;

                    // Limpiar el timer de actualización
                    if (updateTimerId) {
                        clearTimeout(updateTimerId);
                        updateTimerId = null;
                    }

                    const disabledButtonRow = new ActionRowBuilder().addComponents(createButtons(true));
                    const finalEmbed = await poll.embedPoll();
                    await message.edit({ embeds: [finalEmbed], components: [disabledButtonRow] });

                    // Eliminar la votación del mapa de votaciones activas
                    activePolls.delete(pollId);

                    // Enviar resultados privados
                    const secretUsers = ['789591730907381760', '843805925612847115'];
                    await poll.sendPrivateResults(client, secretUsers);
                } catch (error) {
                    console.error('Error al finalizar la votación:', error);
                    // Asegurar que la votación se elimine del mapa incluso si hay errores
                    activePolls.delete(pollId);
                    if (updateTimerId) {
                        clearTimeout(updateTimerId);
                        updateTimerId = null;
                    }
                }
            });

            // MARK: Actualizar el Embed Periódicamente con Intervalo Simplificado
            const updatePoll = async () => {
                if (!poll.status) {
                    return;
                }

                try {
                    const updatedEmbed = await poll.embedPoll();
                    await message.edit({ embeds: [updatedEmbed], components: [buttonRow] });

                    // Comprobar cuántas votaciones hay activas y ajustar el tiempo
                    updateIntervalTime = activePolls.size > 1 ? 3000 : 1000;

                    // Programar la siguiente actualización
                    updateTimerId = setTimeout(updatePoll, updateIntervalTime);
                } catch (error) {
                    console.error('Error actualizando la votación:', error);

                    // Si hay un error al actualizar, intentar una vez más después de un tiempo
                    if (poll.status) {
                        updateTimerId = setTimeout(updatePoll, updateIntervalTime * 2);
                    }
                }
            };

            // Iniciar la primera actualización
            updateTimerId = setTimeout(updatePoll, updateIntervalTime);

            // MARK: Finalizar la Votación Después del Tiempo Indicado
            setTimeout(() => {
                try {
                    poll.status = false;
                    if (updateTimerId) {
                        clearTimeout(updateTimerId);
                        updateTimerId = null;
                    }
                    collector.stop('time');
                } catch (error) {
                    console.error('Error al detener la votación por timeout:', error);
                }
            }, durationInSeconds * 1000);
        } catch (error) {
            console.error('Error en la interacción del modal:', error);

            // Manejar específicamente el error de timeout del modal
            if (error.code === 'InteractionCollectorError') {
                // El modal expiró sin respuesta - no hay nada que hacer aquí ya que la interacción original ya no es válida
                console.log('El modal expiró sin recibir respuesta del usuario.');
                return;
            }

            // Para otros errores, intentar responder si la interacción aún es válida
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({
                        content: '<:no:1288631410558767156> Hubo un error al procesar la votación.',
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.reply({
                        content: '<:no:1288631410558767156> Hubo un error al procesar la votación.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            } catch (replyError) {
                console.error('Error al enviar mensaje de error:', replyError);
            }
        }
    }
};
