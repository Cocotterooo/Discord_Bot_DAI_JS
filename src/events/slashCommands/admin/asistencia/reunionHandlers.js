import {
    EmbedBuilder,
    MessageFlags,
    ChannelType,
    SlashCommandBuilder,
    PermissionFlagsBits,
    TextDisplayBuilder,
    ContainerBuilder,
    SectionBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    SeparatorBuilder,
    UserSelectMenuBuilder,
    ThumbnailBuilder
} from 'discord.js'
import { getReunionActiva, setReunionActiva, clearReunionActiva } from './reunionStore.js'
import { configurarListeners } from './voiceListeners.js'
import { generarReporteReunion } from './reportUtils.js'
import { discordConfig } from '../../../../../config.js'

// MARK: Iniciar reunión
export async function iniciarReunion(interaction, client) {
    const member = interaction.member
    const voiceChannel = member?.voice?.channel

    if (!voiceChannel) {
        return await interaction.reply({
        content: '❌ Debes estar en un canal de voz o salón de actos para iniciar una reunión.',
        flags: MessageFlags.Ephemeral
        })
    }

    if (![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(voiceChannel.type)) {
        return await interaction.reply({
        content: '❌ Solo puedes iniciar reuniones en canales de voz o salones de actos.',
        flags: MessageFlags.Ephemeral
        })
    }

    const reunionActiva = getReunionActiva()
    if (reunionActiva) {
        return await interaction.reply({
        content: `❌ Ya hay una reunión activa: **${reunionActiva.nombre}** en el canal ${reunionActiva.canalNombre}. Finaliza la reunión actual antes de iniciar una nueva.`,
        flags: MessageFlags.Ephemeral
        })
    }

    const nombre = interaction.options.getString('título')

    // MARK: Crear registro de reunión
    const nuevaReunion = {
        nombre,
        canal: voiceChannel.id,
        canalId: voiceChannel.id, // Añadido para compatibilidad con generarReporteReunion
        canalNombre: voiceChannel.name,
        iniciador: interaction.user.id,
        fechaInicio: Date.now(),
        participantes: new Map(), // userId -> { joinTime, leaveTime, totalTime }
        activa: true
    }

    setReunionActiva(nuevaReunion)

    // Registrar usuarios ya presentes en el canal
    voiceChannel.members.forEach(member => {
        nuevaReunion.participantes.set(member.id, {
        joinTime: Date.now(),
        leaveTime: null,
        totalTime: 0,
        displayName: member.displayName,
        username: member.user.username
        })
    })

    // MARK: 🟢 msg INICIO
    const container = new ContainerBuilder()
    const inicio = new TextDisplayBuilder()
        .setContent(`## <:dai:1288623399672741930> ${nuevaReunion.nombre}\n
        ### 📕 Detalles: 
        > <a:online:1288631919352877097> **Registro iniciado.**
        > <:chat_id:1288628721842130976> **Canal**: <#${nuevaReunion.canal}>
        > <:us:1288631396364976128> **Participantes presentes**: ${voiceChannel.members.size}
        > <:reloj:1288631388945256449> **Inicio**: <t:${Math.floor(nuevaReunion.fechaInicio / 1000)}:R>`
    );
    container.addTextDisplayComponents(inicio);
    container.addSeparatorComponents(
        new SeparatorBuilder()
    );
    const firma = new TextDisplayBuilder()
        .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo · **Registro de Sesiones**')
    container.addTextDisplayComponents(firma);
    container.setAccentColor(discordConfig.COLOR)

    await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
    })

    // Configurar listeners si no están ya configurados
    configurarListeners(client)
    }

    // MARK: Finalizar reunión y generar reporte
    export async function finalizarReunion(interaction, client) {
    const reunionActiva = getReunionActiva()
    if (!reunionActiva) {
        return await interaction.reply({
        content: '❌ No hay ninguna reunión activa en este momento.',
        flags: MessageFlags.Ephemeral
        })
    }

    await finalizarYMostrarReporte(interaction, reunionActiva, client)
    }

    // MARK: 📊 Finalizar y mostrar reporte
    async function finalizarYMostrarReporte(interaction, reunion, client) {
    reunion.activa = false
    reunion.fechaFin = Date.now()

    // Finalizar tiempos de participantes activos
    reunion.participantes.forEach((participante, userId) => {
        if (participante.joinTime) {
        const tiempoSesion = Date.now() - participante.joinTime
        participante.totalTime += tiempoSesion
        participante.leaveTime = Date.now()
        participante.joinTime = null
        }
    })

    // Limpiar la reunión activa
    clearReunionActiva()

    const container = await generarReporteReunion(reunion, interaction.guild)

    await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        allowedMentions: { parse: [] }
    })
}
