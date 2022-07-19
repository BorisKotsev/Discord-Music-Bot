const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("@discord-player")

modeule.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song from YouTube")

        .addSubcommand((subcomand) =>
            subcomand.setName("song")
            .setDescription("Loads a song from a URL")
            .addStringOption((option) => option.setName("url").setDescription("The URL of the song").setRequired(true))
        )
        .addSubcommand((subcomand) =>
            subcomand.setName("playlist")
            .setDescription("Loads a playlist from a URL")
            .addStringOption((option) => option.setName("url").setDescription("The URL of the playlist").setRequired(true))
        )
        .addSubcommand((subcomand) =>
            subcomand.setName("search")
            .setDescription("Search for a song")
            .addStringOption((option) => option.setName("searchTerms").setDescription("The search key words").setRequired(true))
        ),

    run: async({ client, interaction }) => {
        if (!interaction.member.voice.channel) {
            return interaction.editReply("You must be in a voice channel to use this command!")
        }

        const queue = await client.player.createQueue(interaction.guild)

        if (!queue.connection) {
            await queue.connect(interaction.member.voice.channel)
        }

        let embed = new MessageEmbed()

        if (interaction.options.getSubcommand() == "song") {

            let url = interaction.options.getString("url")

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })

            if (result.tracks.length == 0) {
                return interaction.editReply("No results found!")
            }

            const song = result.tracks[0]

            await queue.addTrack(song)

            embed
                .setDescription(`Added **${song.title}** to the queue!`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })

        } else if (interaction.options.getSubcommand() == "playlist") {

            let url = interaction.options.getString("url")

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length == 0) {
                return interaction.editReply("No results found!")
            }

            const playlist = result.playlist

            await queue.addTracks(result.tracks)

            embed
                .setDescription(`**${result.tracks.length} songs from ${playlist.title}** have been added to the queue!`)
                .setThumbnail(playlist.thumbnail)

        } else if (interaction.options.getSubcommand() == "search") {

            let url = interaction.options.getString("searchTerms")

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length == 0) {
                return interaction.editReply("No results found!")
            }

            const song = result.tracks[0]

            await queue.addTracks(song)

            embed
                .setDescription(`Added **${song.title}** to the queue!`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })
        }

        if (!queue.playing) {
            await queue.play()
        }

        await interaction.editReply({
            embeds: [embed]
        })
    },
}