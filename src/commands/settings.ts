import Command from '../struct/Command.js'
import Guild from '../struct/Guild.js'
import { EmbedBuilder } from 'discord.js'

export default new Command({
    name: 'settings',
    description: 'Configure server settings.',
    reviewer: true,
    args: [
        {
            name: 'readback',
            description: 'Read back current settings.',
            required: false,
            optionType: 'boolean'
        },
        {
            name: 'buildsubmit',
            description: 'Build submit channel ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'name',
            description: 'Name of server',
            required: false,
            optionType: 'string'
        },
        {
            name: 'reviewersrole',
            description: 'Reviewer role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank1',
            description: 'Level 1 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank1points',
            description: 'Points to get rank 1',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank1name',
            description: 'Name of Rank 1',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank2',
            description: 'Level 2 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank2points',
            description: 'Points to get rank 2',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank2name',
            description: 'Name of Rank 2',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank3',
            description: 'Level 3 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank3points',
            description: 'Points to get rank 3',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank3name',
            description: 'Name of Rank 3',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank4',
            description: 'Level 4 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank4points',
            description: 'Points to get rank 4',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank4name',
            description: 'Name of Rank 4',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank5',
            description: 'Level 4 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank5points',
            description: 'Points to get rank 5',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank5name',
            description: 'Name of Rank 5',
            required: false,
            optionType: 'string'
        }
    ],

    async run(i, client) {

        const options = i.options
        const guildId = i.guild.id

        const guildData = await Guild.findOne({ id: guildId })

        const readBack = options.getBoolean('readback')
        const buildSubmit = options.getString('buildsubmit') || guildData?.submitChannel
        const serverName = options.getString('name') || guildData?.name
        const reviewRole = options.getString('reviewersrole') || guildData?.reviewerRole
        const rank1id = options.getString('rank1') || guildData?.rank1.id
        const rank1Points = options.getNumber('rank1points') || guildData?.rank1.points
        const rank1Name = options.getString('rank1name') || guildData?.rank1.name
        const rank2id = options.getString('rank2') || guildData?.rank2.id
        const rank2Points = options.getNumber('rank2points') || guildData?.rank2.points
        const rank2Name = options.getString('rank2name') || guildData?.rank2.name
        const rank3id = options.getString('rank3') || guildData?.rank3.id
        const rank3Points = options.getNumber('rank3points') || guildData?.rank3.points
        const rank3Name = options.getString('rank3name') || guildData?.rank3.name
        const rank4id = options.getString('rank4') || guildData?.rank4.id
        const rank4Points = options.getNumber('rank4points') || guildData?.rank4.points
        const rank4Name = options.getString('rank4name') || guildData?.rank5.name
        const rank5id = options.getString('rank5') || guildData?.rank5.id
        const rank5Points = options.getNumber('rank5points') || guildData?.rank5.points
        const rank5Name = options.getString('rank5name') || guildData?.rank5.name

        const settings = {
            id: guildId,
            name: serverName,
            submitChannel: buildSubmit,
            reviewerRole: reviewRole,
            rank1: { id: rank1id, points: rank1Points, name: rank1Name },
            rank2: { id: rank2id, points: rank2Points, name: rank2Name },
            rank3: { id: rank3id, points: rank3Points, name: rank3Name },
            rank4: { id: rank4id, points: rank4Points, name: rank4Name },
            rank5: { id: rank5id, points: rank5Points, name: rank5Name }
        }

        Guild.find({ id: guildId }, async function (err, guild) {
            if (err) return i.editReply(`${err}`)
            if (guild) {
                await Guild.updateOne({ id: guildId }, settings, { upsert: true })
                if (readBack) {
                    return i.editReply({
                        embeds: [new EmbedBuilder().setDescription(
                                `Server settings successfully updated!

                                **Server settings for ${serverName}**
                                **Build submit channel:** <#${buildSubmit}> **Reviewer role:** ${client.guilds.cache.get(guildId).roles.cache.get(reviewRole) || 'Not set'}
                                **Ranks:**
                                **${rank1Name}:** ${rank1Points} points (${client.guilds.cache.get(guildId).roles.cache.get(rank1id) || 'Not set'})
                                **${rank2Name}:** ${rank2Points} points (${client.guilds.cache.get(guildId).roles.cache.get(rank2id) || 'Not set'})
                                **${rank3Name}:** ${rank3Points} points (${client.guilds.cache.get(guildId).roles.cache.get(rank3id) || 'Not set'})
                                **${rank4Name}:** ${rank4Points} points (${client.guilds.cache.get(guildId).roles.cache.get(rank4id) || 'Not set'})
                                **${rank5Name}:** ${rank5Points} points (${client.guilds.cache.get(guildId).roles.cache.get(rank5id) || 'Not set'})`
                        )]
                    })
                } else {
                    return i.editReply('Server settings successfully updated!')
                }
            } else {
                return i.editReply(
                    'This server is not registered. Use /register to register it.'
                )
            }
        })
    }
})
