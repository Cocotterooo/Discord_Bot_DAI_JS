import {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder
} from 'discord.js'
import { organizarParticipantesPorRol } from './roleUtils.js'
import { roleIds } from './config.js'
import { discordConfig } from '../../../../../config.js'

// MARK: 🕐 Formatear tiempo
function formatearTiempo(milisegundos) {
    const minutos = Math.floor(milisegundos / (1000 * 60))
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    if (horas > 0) {
        return `${horas}h ${minutosRestantes}min`
    }
    return `${minutos}min`
}

// MARK: 📊 Generar reporte de reunión
export async function generarReporteReunion(reunion, guild) {
    const duracionTotal = Math.floor((reunion.fechaFin - reunion.fechaInicio) / 60000) // Duración en minutos

    const container = new ContainerBuilder()

    // Organizar participantes por roles
    const participantesPorRol = await organizarParticipantesPorRol(reunion.participantes, guild)
    const inicio = new TextDisplayBuilder().setContent(
        `\n# <:dai:1288623399672741930>  ${reunion.nombre}\n ## 📕 Detalles:\n> <a:offline:1288631912180744205> **Registro finalizado.**\n> <:us:1288631396364976128> **Total de asistentes**: ${reunion.participantes.size}\n> <:chat_id:1288628721842130976> **Canal:** <#${reunion.canalId}>\n> <:reloj:1288631388945256449> Duración total: **${duracionTotal} minutos**\n> 🔹 **Inicio:** <t:${Math.floor(reunion.fechaInicio / 1000)}:R>\n> 🔹 **Fin:** <t:${Math.floor(reunion.fechaFin / 1000)}:R>
        ## Registro de Asistencia:`
    );
    container.addTextDisplayComponents(inicio);
    container.addSeparatorComponents(
        new SeparatorBuilder()
    );
    // MARK: Añadir secciones por rol
    if (participantesPorRol.CD.directiva.length > 0) {
        const directiva = new TextDisplayBuilder().setContent(
            '### 💼 Directiva de la Comisión Delegada:'
        );
        container.addTextDisplayComponents(directiva);

        let contenidoDirectiva = ''
        for (const miembro of participantesPorRol.CD.directiva) {
            let roleId = null
            if (miembro.delegado) {
                roleId = roleIds.CD.directiva.delegado
            } else if (miembro.subdelegado) {
                roleId = roleIds.CD.directiva.subdelegado
            } else if (miembro.secretaria) {
                roleId = roleIds.CD.directiva.secretaria
            } else if (miembro.tesoreria) {
                roleId = roleIds.CD.directiva.tesoreria
            }
            contenidoDirectiva += `> 🔸 **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)} <@&${roleId}>\n`
        }
        const usuariosDirectiva = new TextDisplayBuilder().setContent(contenidoDirectiva.trim())
        container.addTextDisplayComponents(usuariosDirectiva);
        container.addSeparatorComponents(
            new SeparatorBuilder()
        );
    }
    if (participantesPorRol.CD.extendida.length > 0) {
        const extendida = new TextDisplayBuilder().setContent(
            '### 💼 Directiva Extendida de la Comisión Delegada:'
        );
        container.addTextDisplayComponents(extendida);

        let contenidoExtendida = ''
        for (const miembro of participantesPorRol.CD.extendida) {
            let roleId = null
            if (miembro.coord_infraestructuras) {
                roleId = roleIds.CD.extendida.coord_infraestructuras
            } else if (miembro.coord_comunicacion) {
                roleId = roleIds.CD.extendida.coord_comunicacion
            } else if (miembro.coord_deportes_ocio) {
                roleId = roleIds.CD.extendida.coord_deportes_ocio
            } else if (miembro.coord_exteriores) {
                roleId = roleIds.CD.extendida.coord_exteriores
            }
            contenidoExtendida += `> ➖ **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)} <@&${roleId}>\n`
        }
        const usuariosExtendida = new TextDisplayBuilder().setContent(contenidoExtendida.trim())
        container.addTextDisplayComponents(usuariosExtendida);
        container.addSeparatorComponents(
            new SeparatorBuilder()
        );
    }
    if (participantesPorRol.CD.miembros.length > 0) {
        const miembros = new TextDisplayBuilder().setContent(
            '### 👮 Miembros de la Comisión Delegada:'
        );
        container.addTextDisplayComponents(miembros);

        let contenidoMiembros = ''
        for (const miembro of participantesPorRol.CD.miembros) {
            const comisiones = miembro.comisiones.map(comisionId => {
                return `<@&${comisionId}>`
            }).join(', ')
            contenidoMiembros += `> 🔺 **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)} ${comisiones}\n`
        }
        const usuariosMiembros = new TextDisplayBuilder().setContent(contenidoMiembros.trim())
        container.addTextDisplayComponents(usuariosMiembros);
        container.addSeparatorComponents(
            new SeparatorBuilder()
        );
    }
    if (participantesPorRol.CD.tutorandos.length > 0) {
        const tutorandos = new TextDisplayBuilder().setContent(
            '### 🐕 Tutorandos de la Comisión Delegada:'
        );
        container.addTextDisplayComponents(tutorandos);

        let contenidoTutorandos = ''
        for (const miembro of participantesPorRol.CD.tutorandos) {
            const comisiones = miembro.comisiones.map(comisionId => {
                return `<@&${comisionId}>`
            }).join(', ')
            contenidoTutorandos += `> 🔻 **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)} ${comisiones}\n`
        }
        const usuariosTutorandos = new TextDisplayBuilder().setContent(contenidoTutorandos.trim())
        container.addTextDisplayComponents(usuariosTutorandos);
        container.addSeparatorComponents(
            new SeparatorBuilder()
        );
    }
    if (participantesPorRol.XA.length > 0) {
        const xa = new TextDisplayBuilder().setContent(
            '### 👷 Miembros de la Junta de Alumnado:'
        );
        container.addTextDisplayComponents(xa);

        let contenidoXA = ''
        for (const miembro of participantesPorRol.XA) {
            let roleId = null
            if (miembro.delegado) {
                roleId = roleIds.XA.delegado
            } else if (miembro.subdelegado) {
                roleId = roleIds.XA.subdelegado
            }
            if (roleId) {
                contenidoXA += `> **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)} <@&${roleId}>\n`
            } else {
                contenidoXA += `> **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)}\n`
            }
        }
        const usuariosXA = new TextDisplayBuilder().setContent(contenidoXA.trim())
        container.addTextDisplayComponents(usuariosXA);
        container.addSeparatorComponents(
            new SeparatorBuilder()
        );
    }

    if (participantesPorRol.otros.length > 0) {
        const otros = new TextDisplayBuilder().setContent(
            '### <:lupa:1288631408222277642> Asistentes sin rol específico'
        );
        container.addTextDisplayComponents(otros);

        let contenidoOtros = ''
        for (const miembro of participantesPorRol.otros) {
            contenidoOtros += `> **${miembro.displayName}** (${miembro.username}) - ${formatearTiempo(miembro.totalTime)}\n`
        }
        const usuariosOtros = new TextDisplayBuilder().setContent(contenidoOtros.trim())
        container.addTextDisplayComponents(usuariosOtros);
    }
    const firma = new TextDisplayBuilder()
        .setContent('-# <:dai:1288623399672741930>  Delegación de alumnado de industriales - UVigo · **Registro de Sesiones**')
    container.addTextDisplayComponents(firma);
    container.setAccentColor(discordConfig.COLOR)

    return container
}
