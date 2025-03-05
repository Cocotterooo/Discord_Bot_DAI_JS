export async function handleButtonInteraction (interaction) {
  const roles = {
    role1: 'ID_DEL_ROLE_1',
    role2: 'ID_DEL_ROLE_2',
    role3: 'ID_DEL_ROLE_3',
    role4: 'ID_DEL_ROLE_4'
  }

  if (!roles[interaction.customId]) return

  const roleId = roles[interaction.customId]
  const member = interaction.member

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId)
    await interaction.reply({ content: '❌ Te quitamos el rol.', ephemeral: true })
  } else {
    await member.roles.add(roleId)
    await interaction.reply({ content: '✅ Te hemos asignado el rol.', ephemeral: true })
  }
}
