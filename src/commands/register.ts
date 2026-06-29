import Command from '../struct/Command.js'
import Guild from '../struct/Guild.js'

export default new Command({
    name: 'register',
    description: 'Register a new server.',
    reviewer: true,
    args: [
        {
            name: 'buildsubmit',
            description: 'Build submit channel ID',
            required: true,
            optionType: 'string'
        },
        {
            name: 'name',
            description: 'Name of server',
            required: true,
            optionType: 'string'
        },
        {
            name: 'reviewersrole',
            description: 'Reviewer role ID',
            required: true,
            optionType: 'string'
        },
        {
            name: 'rank1',
            description: 'Level 1 rank role ID',
            required: true,
            optionType: 'string'
        },
        {
            name: 'rank2',
            description: 'Level 2 rank role ID',
            required: true,
            optionType: 'string'
        },
        {
            name: 'rank3',
            description: 'Level 3 rank role ID',
            required: true,
            optionType: 'string'
        },
        {
            name: 'rank4',
            description: 'Level 4 rank role ID',
            required: true,
            optionType: 'string'
        },
        {
            name: 'rank5',
            description: 'Level 5 rank role ID',
            required: true,
            optionType: 'string'
        }
    ],
    async run(i, client) {

        const options = i.options
        const guildId = i.guild.id

        const currentSettings = await Guild.findOne({ id: guildId })

        const buildSubmit = options.getString('buildsubmit') || currentSettings?.submitChannel
        const serverName = options.getString('name') || currentSettings?.name
        const reviewRole = options.getString('reviewersrole') || currentSettings?.reviewerRole
        const rank1id = options.getString('rank1') || currentSettings?.rank1.id
        const rank2id = options.getString('rank2') || currentSettings?.rank2.id
        const rank3id = options.getString('rank3') || currentSettings?.rank3.id
        const rank4id = options.getString('rank4') || currentSettings?.rank4.id
        const rank5id = options.getString('rank5') || currentSettings?.rank5.id

        const settings = {
            id: guildId,
            name: serverName,
            submitChannel: buildSubmit,
            reviewerRole: reviewRole,
            rank1: { id: rank1id, points: 0, name: 'Novice Builder'},
            rank2: { id: rank2id, points: 50, name: 'Builder'},
            rank3: { id: rank3id, points: 300, name: 'Senior Builder'},
            rank4: { id: rank4id, points: 1000, name: 'Master Builder'},
            rank5: { id: rank5id, points: 2000, name: 'Champion'}
        }

        Guild.find({ id: guildId }, async function(err, guild) {
            if (err) return i.editReply(`${err}`)
            if (guild) {
                return i.editReply('This server is already registered. Use /settings to edit values.')
            } else {
                await Guild.updateOne({ id: guildId }, settings, { upsert: true })
                return i.editReply('New server successfully registered! Use /settings to edit the default values.')
            }
        })
    }
})