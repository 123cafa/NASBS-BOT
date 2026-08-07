import Bot from '../struct/Client.js'
import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js'

export default async function execute(client: Bot, interaction: CommandInteraction) {
    if (
        (!client.test && ['935926834019844097', '1377005229618368652'].includes(interaction.guild?.id)) ||
        (client.test && !['935926834019844097', '1377005229618368652'].includes(interaction.guild?.id))
    )
        return

    if (!interaction.isCommand()) return

    if (!interaction.guild) {
        return interaction.reply('Commands must be used in servers.')
    }

    const guildData = client.guildsData.get(interaction.guild.id)
    if (!guildData && (interaction.commandName != 'register')) {
        return interaction.reply('This server is not registered. Ask the server owner to register it by using /register')
    }

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
        if (command.reviewer == true) {
            const member = await interaction.guild.members.fetch(interaction.user.id)
            let reviewerRole: string | undefined
            if (guildData) {
                reviewerRole = guildData.reviewerRole
            } else {
                reviewerRole = null
            }

            if (guildData && !(member.roles.cache.has(reviewerRole) || member.id == interaction.guild.ownerId)) {
                return await interaction.reply(
                    'You do not have permission to use this command.'
                )
            }
            // This allows the server owner to use /register and setup the reviewer role. Otherwise no one can use the bot commands.
            if (!guildData && !(member.id == interaction.guild.ownerId)) {
                return await interaction.reply(
                    'The server is not registered. Ask the server owner to register it by using /register'
                )
            }
        }

        await interaction.deferReply()

        command.run(interaction as ChatInputCommandInteraction, client)

    } catch (err) {
        console.log(err)
    }
}
