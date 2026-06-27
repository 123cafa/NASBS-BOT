import Command from '../struct/Command.js'
import Guild from '../struct/Guild.js'

export default new Command({
    name: 'settings',
    description: 'Configure server settings.',
    reviewer: true,
    args: [
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
            description: 'Points to get level 1',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank2',
            description: 'Level 2 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank2points',
            description: 'Points to get level 1',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank3',
            description: 'Level 3 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank3points',
            description: 'Points to get level 1',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank4',
            description: 'Level 4 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank4points',
            description: 'Points to get level 1',
            required: false,
            optionType: 'number'
        },
        {
            name: 'rank5',
            description: 'Level 4 rank role ID',
            required: false,
            optionType: 'string'
        },
        {
            name: 'rank5points',
            description: 'Points to get level 1',
            required: false,
            optionType: 'number'
        }
    ],
    async run(i, client) {


        // TODO: I think this will always be true in this bot so likely this is the end of the command for now...
        /* if (i) {
            return i.editReply('this command is under construction.')
        } */

        const options = i.options
        const guildId = i.guild.id

        const currentSettings = await Guild.findOne({ id: guildId })

        const buildSubmit = options.getString('buildsubmit') || currentSettings?.submitChannel
        const serverName = options.getString('name') || currentSettings?.name
        const reviewRole = options.getString('reviewersrole') || currentSettings?.reviewerRole
        const rank1id = options.getString('rank1') || currentSettings?.rank1.id
        const rank1Points = options.getNumber('rank1points') || currentSettings?.rank1.points
        const rank2id = options.getString('rank2') || currentSettings?.rank2.id
        const rank2Points = options.getNumber('rank2points') || currentSettings?.rank2.points
        const rank3id = options.getString('rank3') || currentSettings?.rank3.id
        const rank3Points = options.getNumber('rank3points') || currentSettings?.rank3.points
        const rank4id = options.getString('rank4') || currentSettings?.rank4.id
        const rank4Points = options.getNumber('rank4points') || currentSettings?.rank4.points
        const rank5id = options.getString('rank5') || currentSettings?.rank5.id
        const rank5Points = options.getNumber('rank5points') || currentSettings?.rank5.points


        const settings = {
            id: guildId,
            name: serverName,
            submitChannel: buildSubmit,
            reviewerRole: reviewRole,
            rank1: { id: rank1id, points: rank1Points, name: 'Temp1'},
            rank2: { id: rank2id, points: rank2Points, name: 'Temp2'},
            rank3: { id: rank3id, points: rank3Points, name: 'Temp3'},
            rank4: { id: rank4id, points: rank4Points, name: 'Temp4'},
            rank5: { id: rank5id, points: rank5Points, name: 'Temp5'}
        }
        console.log(currentSettings)
        console.log(settings)

        /* Guild.find({ id: guildId }, async function(err, guild) {
            if (err) return i.editReply(`${err}`)
            await Guild.updateOne({ id: guildId }, settings, { upsert: true })
            if (guild) {
                return i.editReply('Server settings successfully updated!')
            } else {
                return i.editReply('New server settings successfully created!')
            }
            //  client.guildsData.set(guildId, settings)
        }) */
    }
})
