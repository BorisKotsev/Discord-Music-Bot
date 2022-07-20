const { SlashCommandBuilder } = require(`@discordjs/builders`)

module.exports = {
    data: new SlashCommandBuilder().setName("skipTo").setDescription("Skips to a specific song #")
        .addNumberOption((option) =>
            option.setName("tracknumber").setDescription("The track to skip to").setMinValue(1).setRequired(true)
        ),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue) {
            return await interaction.editReply("There are no songs in the queue")
        }

        const trackNumber = interaction.options.getNumber("tracknumber")

        if (trackNumber > queue.tracks.length) {
            return await interaction.editReply("Invalid track number")
        }

        queue.skipTo(trackNumber - 1)

        await interaction.editReply(`Skipped ahead to track number ${trackNum}`)
    },
}