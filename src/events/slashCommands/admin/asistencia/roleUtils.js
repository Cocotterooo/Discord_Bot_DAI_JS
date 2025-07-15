import { roleIds } from './config.js'

/* Formato de salida
{
    CD: {
        directiva: [
            {
                displayName: string,
                username: string,
                totalTime: number,
                delegado: boolean,
                subdelegado: boolean,
                tesoreria: boolean,
                secretaria: boolean,
            }
        ],
        extendida: [
            {
                displayName: string,
                username: string,
                totalTime: number,
                coord_comunicacion: boolean,
                coord_infraestructuras: boolean,
                coord_exteriores: boolean,
                coord_deportes_ocio: boolean
            }
        ],
        miembros: [
            {
                displayName: string,
                username: string,
                totalTime: number,
                comisiones: [string] // Lista de comisiones a las que pertenece (Ids de roles)
            }
        ],
        tutorandos: [
        {
                displayName: string,
                username: string,
                totalTime: number,
                comisiones: [string] // Lista de comisiones a las que pertenece (Ids de roles)
            }
        ]
    },
    XA: [
        {
            displayName: string,
            username: string,
            totalTime: number,
            delegado: boolean,
            subdelegado: boolean
        }
    ],
    otros: [
        {
            displayName: string,
            username: string,
            totalTime: number
        }
    ]
}
*/

// MARK: 📩 Organizar Participantes por Rol
export async function organizarParticipantesPorRol(participantes, guild) {
    const resultado = {
        CD: {
            directiva: [],
            extendida: [],
            miembros: [],
            tutorandos: []
        },
        XA: [],
        otros: []
    }

    for (const [userId, participante] of participantes) {
        try {
            // Obtener el miembro del servidor
            const member = await guild.members.fetch(userId)
            let rolEncontrado = false

            // Crear objeto base del usuario
            const usuarioBase = {
                displayName: participante.displayName,
                username: participante.username,
                totalTime: participante.totalTime
            }

            // Buscar en directiva CD
            for (const [cargo, roleId] of Object.entries(roleIds.CD.directiva)) {
                if (member.roles.cache.has(roleId)) {
                    const usuarioDirectiva = {
                        ...usuarioBase,
                        delegado: cargo === 'delegado',
                        subdelegado: cargo === 'subdelegado',
                        tesoreria: cargo === 'tesoreria',
                        secretaria: cargo === 'secretaria'
                    }
                    resultado.CD.directiva.push(usuarioDirectiva)
                    rolEncontrado = true
                    break
                }
            }

            if (rolEncontrado) continue

            // Buscar en directiva extendida CD
            for (const [cargo, roleId] of Object.entries(roleIds.CD.extendida)) {
                if (member.roles.cache.has(roleId)) {
                    const usuarioExtendida = {
                        ...usuarioBase,
                        coord_comunicacion: cargo === 'coord_comunicacion',
                        coord_infraestructuras: cargo === 'coord_infraestructuras',
                        coord_exteriores: cargo === 'coord_exteriores',
                        coord_deportes_ocio: cargo === 'coord_deportes_ocio'
                    }
                    resultado.CD.extendida.push(usuarioExtendida)
                    rolEncontrado = true
                    break
                }
            }

            if (rolEncontrado) continue

            // Buscar en XA
            for (const [cargo, roleId] of Object.entries(roleIds.XA)) {
                if (member.roles.cache.has(roleId)) {
                    const usuarioXA = {
                        ...usuarioBase,
                        delegado: cargo === 'delegado',
                        subdelegado: cargo === 'subdelegado'
                    }
                    resultado.XA.push(usuarioXA)
                    rolEncontrado = true
                    break
                }
            }

            if (rolEncontrado) continue

            // Buscar en miembros libres CD
            if (member.roles.cache.has(roleIds.CD.libres.miembro)) {
                // Buscar comisiones
                const comisiones = []
                for (const [comision, roleId] of Object.entries(roleIds.CD.comisiones)) {
                    if (member.roles.cache.has(roleId)) {
                        comisiones.push(roleId) // Guardar la ID del rol, no el nombre
                    }
                }
                const usuarioMiembro = {
                    ...usuarioBase,
                    comisiones
                }
                resultado.CD.miembros.push(usuarioMiembro)
                rolEncontrado = true
                continue
            }

            // Buscar en tutorandos CD
            if (member.roles.cache.has(roleIds.CD.libres.tutorando)) {
                // Buscar comisiones
                const comisiones = []
                for (const [comision, roleId] of Object.entries(roleIds.CD.comisiones)) {
                    if (member.roles.cache.has(roleId)) {
                        comisiones.push(roleId) // Guardar la ID del rol, no el nombre
                    }
                }
                const usuarioTutorando = {
                    ...usuarioBase,
                    comisiones
                }
                resultado.CD.tutorandos.push(usuarioTutorando)
                rolEncontrado = true
                continue
            }

            // Si no se encuentra en ningún rol específico
            if (!rolEncontrado) {
                resultado.otros.push(usuarioBase)
            }
        } catch (error) {
            console.error(`Error al obtener miembro ${userId}:`, error)
            // Si no se puede obtener el miembro, agregarlo a "otros"
            const usuarioError = {
                displayName: participante.displayName,
                username: participante.username,
                totalTime: participante.totalTime
            }
            resultado.otros.push(usuarioError)
        }
    }

    return resultado
}
