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

        const buildSubmit = options.getString('buildsubmit')
        const serverName = options.getString('name')
        const reviewRole = options.getString('reviewersrole')
        const rank1id = options.getString('rank1')
        const rank2id = options.getString('rank2')
        const rank3id = options.getString('rank3')
        const rank4id = options.getString('rank4')
        const rank5id = options.getString('rank5')

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
            if (guild.length>0) {
                return i.editReply('This server is already registered. Use /settings to edit values.')
            } else {
                await Guild.updateOne({ id: guildId }, settings, { upsert: true })
                await client.loadGuilds()
                return i.editReply('New server successfully registered! Use /settings to edit the default values.')
            }
        })
    }
})