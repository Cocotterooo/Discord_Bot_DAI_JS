// MARK: DISCORD CONFIG
/****************************************************************
 * CONFIGURACIÓN DE DISCORD:
 ****************************************************************/
export const discordConfig = {
  PREFIX: '*',
  activities: {
    PREPARANDO_SAN_PEPE: '🤑Preparando 𝗦𝗔𝗡 𝗣𝗘𝗣𝗘',
    EN_SAN_PEPE: '¡HOY ES SAN PEPE!',
    MOD: 'Moderando'
  },
  color: '#00ace2',
  ownerId: '789591730907381760',
  defaultEmbed: {
    FOOTER_SEPARATOR: 'https://i.imgur.com/8GkOfv1.png',
    MODERATOR_ICON: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless',
    DAI_SIGN: 'Delegación de Alumnos de Industriales - UVigo'
  },
  mentions: {
    asociationsRoleIds: {
      ceeibis: {
        coord: 1314547388006006814,
        member: 1314547662036664390
      },
      spacelab: {
        coord: 1300181833081950299,
        member: 1300181978166988860
      },
      motorsport: {
        coord: 1300184532200329339,
        member: 1300184607786012732
      },
      ces: {
        coord: 1300184021615247380,
        member: 1300184160068964403
      }
    }
  },
  slashCommands: {
    asociation: {
      ceeibis: {
        nuevo: '/nuevo_ceeibis',
        eliminar: '/eliminar_ceeibis'
      },
      spacelab: {
        nuevo: '/nuevo_spacelab',
        eliminar: '/eliminar_spacelab'
      },
      motorsport: {
        nuevo: '/nuevo_motorsport',
        eliminar: '/eliminar_motorsport'
      },
      ces: {
        nuevo: '/nuevo_ces',
        eliminar: '/eliminar_ces'
      }
    }
  },
  channelIds: {
    asociations: {
      CEEIBIS: 1314739909227057164,
      SPACELAB: 1300183021416349788,
      MOTORSPORT: 1288508046057930804,
      CES: 1300189175747842068
    }
  }
}

export const instagramConfig = {
  BASE_URL: 'https://graph.instagram.com',
  USER_ID: '17841406607088471'
}

// MARK: EMBEDS
/****************************************************************
 * CONFIGURACIÓN DE EMBEDS:
 ****************************************************************/

// MARK: Verificacion y Soporte
export const verificationAndSupportEmbed = {
  openTicket: {
    description: `# <:dai:1288623399672741930> Soporte y Verificación
                  ## 🎫 Crea un Ticket para recibir **ayuda** de la administración.
                  > Una vez creado, **descríbenos tu duda o **problema** para que podamos asistirte de manera adecuada.
                  >  
                  > Nos esforzaremos por ayudarte lo antes posible.
                  ## <:verificado:1288628715982553188> Verifica tu cuenta para acceder a todos los canales del servidor.
                  > Para obtener **acceso** a **eventos** exclusivos de la **EEI**, así como a **canales privados** y de **apuntes**, **verifica que eres estudiante de la EEI** enviándonos tu **matrícula** o una captura de **Moovi**.
                  >  
                  > Procesaremos tu verificación a la mayor brevedad posible.`,
    color: discordConfig.COLOR,
    footer: {
      text: discordConfig.DAI_SIGN,
      iconURL: discordConfig.EMBED_FOOTER_SEPARATOR
    }
  },
  supportTicket: {
    description: function (user) {
      return `## <:info:1288631394502709268> ¡Bienvenido al Soporte ${user.mention}!
        ### Te atenderá un miembro de la DAI lo antes posible.
        Por favor, cuéntanos tu problema o duda para que podamos ayudarte.`
    },
    verificationTicket: {
      description: function (user) {
        return `## <:verificado:1288628715982553188> ¡Hola ${user.mention}!
        ### ¡Para que podamos verificarte necesitamos pruebas!
        Por favor, envíanos tu **matrícula** o una captura de pantalla de **Moovi** que confirme que eres estudiante en la **EEI**.`
      }
    }
  }
}
// MARK: Asociaciones
export const ceiibisEmbed = {
  description: '## <a:flecha:1290411623802208257> **¡Bienvenid@ a la categoría de CEEIBIS!**',
  fields: {
    config: {
      name: '<:info:1288631394502709268> Configuración de la Categoría',
      value: '> La categoría es totalemte configurable por el rol <@&{ASOCIATION_ROLE_IDS["ceeibis"]["coord"]}>',
      inline: false
    },
    addUser: {
      name: '<:entrar:1288631392070012960> Añadir nuevos Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.ceeibis.nuevo}\`
              > Otorgará el rol <@&${discordConfig.mentions.asociationsRoleIds.ceeibis.member}> al usuario`,
      inline: false
    },
    delUser: {
      name: '<:salir:1288975442828726374> Eliminar Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.ceeibis.eliminar}\`
              > Eliminará el rol <@&${discordConfig.mentions.asociationsRoleIds.ceeibis.member}> del usuario`,
      inline: false
    }
  },
  color: discordConfig.COLOR
}

export const spaceEmbed = {
  description: '## <a:flecha:1290411623802208257> **¡Bienvenid@ a la categoría de SpaceLab!**',
  fields: {
    config: {
      name: '<:info:1288631394502709268> Configuración de la Categoría',
      value: '> La categoría es totalemte configurable por el rol <@&{ASOCIATION_ROLE_IDS["spacelab"]["coord"]}>',
      inline: false
    },
    addUser: {
      name: '<:entrar:1288631392070012960> Añadir nuevos Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.spacelab.nuevo}\`
              > Otorgará el rol <@&${discordConfig.mentions.asociationsRoleIds.spacelab.member}> al usuario`,
      inline: false
    },
    delUser: {
      name: '<:salir:1288975442828726374> Eliminar Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.spacelab.eliminar}\`
              > Eliminará el rol <@&${discordConfig.mentions.asociationsRoleIds.spacelab.member}> del usuario`,
      inline: false
    }
  },
  color: discordConfig.COLOR
}

export const motorsportEmbed = {
  description: '## <a:flecha:1290411623802208257> **¡Bienvenid@ a la categoría de MotorSport!**',
  fields: {
    config: {
      name: '<:info:1288631394502709268> Configuración de la Categoría',
      value: '> La categoría es totalemte configurable por el rol <@&{ASOCIATION_ROLE_IDS["motorsport"]["coord"]}>',
      inline: false
    },
    addUser: {
      name: '<:entrar:1288631392070012960> Añadir nuevos Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.motorsport.nuevo}\`
              > Otorgará el rol <@&${discordConfig.mentions.asociationsRoleIds.motorsport.member}> al usuario`,
      inline: false
    },
    delUser: {
      name: '<:salir:1288975442828726374> Eliminar Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.motorsport.eliminar}\`
              > Eliminará el rol <@&${discordConfig.mentions.asociationsRoleIds.motorsport.member}> del usuario`,
      inline: false
    }
  },
  color: discordConfig.COLOR
}

export const cesEmbed = {
  description: '## <a:flecha:1290411623802208257> **¡Bienvenid@ a la categoría de CES!**',
  fields: {
    config: {
      name: '<:info:1288631394502709268> Configuración de la Categoría',
      value: '> La categoría es totalemte configurable por el rol <@&{ASOCIATION_ROLE_IDS["ces"]["coord"]}>',
      inline: false
    },
    addUser: {
      name: '<:entrar:1288631392070012960> Añadir nuevos Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.ces.nuevo}\`
              > Otorgará el rol <@&${discordConfig.mentions.asociationsRoleIds.ces.member}> al usuario`,
      inline: false
    },
    delUser: {
      name: '<:salir:1288975442828726374> Eliminar Miembros',
      value: `> Utiliza el comando \`${discordConfig.slashCommands.asociation.ces.eliminar}\`
              > Eliminará el rol <@&${discordConfig.mentions.asociationsRoleIds.ces.member}> del usuario`,
      inline: false
    }
  },
  color: discordConfig.COLOR
}

export const staffRoleSelector = {
  description: `## <a:flecha:1290411623802208257> Selecciona o solicita tus roles.
        **Selecciona**, **elimina** o **solicita** los roles que pertenezcan a las **funciones que desempeñas** en la **Delegación de Alumnos de Industriales**. Si tienes dudas, contacta con <@&1288552528484630598>.
        
        ### <:escudo:1288628696391090299> Directiva:
        > <@&1292466209165414411> 
        > <@&1292466392439722016> 
        > <@&1292467283284852888> 
        > <@&1292467186320805948> 
        ### <:escudo:1288628696391090299> Directiva Extendida:
        > <@&1292472596146815037> 
        > <@&1296745099497312267> 
        > <@&1299901349994954794> 
        > <@&1299901080745934888> 
        ### <:us:1288631396364976128> Comisiones Delegadas:
        > <@&1292466487247896699>
        > <@&1292466970687442984>
        > <@&1292468137845067776>
        > <@&1292466863707521167>
        ### <:exclamacion:1288628819548176514> Especiales:
        > <@&1288552528484630598> <:desarrollador:1288628718423638037>
        > <@&1288206919118618839> <:moderador:1288628804276977735>
        > <@&1288553111119462451>
        ### Selección:`,
  fields: {
    specialRoles: {
      name: '<:verificado:1288628715982553188> Roles Especiales',
      value: 'Para obtener un rol de las secciones **Directiva**, **Directiva Extendida** o **Especiales**, contacta con <@&1288552528484630598>.',
      inline: false
    },
    comisions: {
      name: '<:verificado:1288628715982553188> Comisiones Delegadas',
      value: 'Para **obtener** o **eliminar** un rol de una Comisión Delegada solo haz click en los botones.',
      inline: false
    }

  }
}
