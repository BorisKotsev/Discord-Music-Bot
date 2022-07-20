const Discord = require(`discord.js`)
const dotnev = require(`dotenv`)
const { REST } = require(`@discordjs/rest`)
const { Routes } = require(`discord-api-types/v9`)
const fs = require(`fs`)
const { Player } = require("discord-player")
const { Client, GatewayIntentBits } = require('discord.js')

dotnev.config()

const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"

const CLIENT_ID = "998851992719982644" //Bot ID
const GUILD_ID = "998854222223265812" // Server ID

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
})

client.slashCommands = new Discord.Collection()

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

let commands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))

for (const file of slashFiles) {
    const slashCmd = require(`./slash/${file}`)
    client.slashCommands.set(slashCmd.data.name, slashCmd)

    if (LOAD_SLASH) {
        commands.push(slashCmd.data.toJSON())
    }
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Loading Slash Commands...")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
        .then(() => {
            console.log("Slash Commands Loaded!")
            process.exit(0)
        })
        .catch((err) => {
            if (err) {
                console.log(err)
                process.exit(1)
            }
        })
} else {
    client.on("ready", () => {
        console.log(`Logged as ${clinet.user.tag}`)
    })

    clinet.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) {
                return
            }

            const slashCmd = client.slashCommands.get(interaction.commandName)

            if (!slashCmd) {
                interaction.reply("Command not found!")
            }

            await interaction.deferReply()
            await slashCmd.run({ client, interaction })
        }

        handleCommand()
    })

    client.login(TOKEN)
}