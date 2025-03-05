export async function handleRoleButtons (interaction) {
  const roles = {
    comision_deportes: 'ID_DEL_ROLE_1',
    comision_exteriores: 'ID_DEL_ROLE_2',
    comision_comunicacion: 'ID_DEL_ROLE_3',
    comision_infraestructuras: 'ID_DEL_ROLE_4'
  }

  if (!roles[interaction.customId]) return

  const roleId = roles[interaction.customId]
  const member = interaction.member

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId)
    await interaction.reply({ content: 'El rol ha sido eliminado.', ephemeral: true })
  } else {
    await member.roles.add(roleId)
    await interaction.reply({ content: 'El rol ha sido asignado.', ephemeral: true })
  }
}
