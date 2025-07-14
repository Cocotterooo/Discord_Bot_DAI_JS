import { MessageFlags } from 'discord.js';

export default {
    // ID personalizado del botón que debe coincidir con el definido en staffRoles.js
    id: 'com_deportes',

    /**
     * Ejecuta la lógica del botón para asignar/remover el rol de Ocio y Deportes
     * @param {Interaction} interaction - La interacción del botón
     * @param {Client} client - El cliente de Discord
     */
    async execute(interaction, client) {
        // ID del rol de la comisión de Ocio y Deportes
        const roleId = '1292468137845067776';
        const roleName = 'Ocio y Deportes';

        try {
            // Obtener el rol del servidor
            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) {
                return await interaction.reply({
                    content: '<:no:1288631410558767156> No se pudo encontrar el rol de Ocio y Deportes.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Verificar si el usuario ya tiene el rol
            const member = interaction.member;
            const hasRole = member.roles.cache.has(roleId);

            if (hasRole) {
                // Si tiene el rol, quitárselo
                await member.roles.remove(role);
                await interaction.reply({
                    content: `<:no:1288631410558767156> Se te ha **eliminado** el rol de <@&${roleId}>.`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                // Si no tiene el rol, agregárselo
                await member.roles.add(role);
                await interaction.reply({
                    content: `<:si:1288631406452412428> Se te ha **asignado** el rol de <@&${roleId}>.`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error(`Error manejando el botón de ${roleName}:`, error);

            // Verificar si ya se respondió a la interacción
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '<:no:1288631410558767156> Hubo un error al procesar tu solicitud. Contacta con <@&1288552528484630598>',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: '<:no:1288631410558767156> Hubo un error al procesar tu solicitud. Contacta con <@&1288552528484630598>',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
