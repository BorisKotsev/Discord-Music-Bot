const { SlashCommandBuilder } = require(`@discordjs/builders`)

module.exports = {
    data: new SlashCommandBuilder().setName("resume").setDescription("Resumes the current song"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue) {
            return await interaction.editReply("There are no songs in the queue")
        }

        queue.setPaused(false)

        await interaction.editReply("Use `/pause` to pause the music")
    },
}