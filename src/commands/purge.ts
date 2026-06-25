import Command from '../struct/Command.js'
import { Message, TextChannel } from 'discord.js'
import Submission from '../struct/Submission.js'
import Builder from '../struct/Builder.js'
import areDmsEnabled from '../utils/areDmsEnabled.js'
import { updateReviewerForPurge } from '../review/updateReviewer.js'
import Rejection from '../struct/Rejection.js'
import Responses from '../utils/responses.js'

export default new Command({
    name: 'purge',
    description: 'Remove a submission that has already been accepted',
    reviewer: true,
    args: [
        {
            name: 'submissionid',
            description: 'Msg id of the submission',
            required: true,
            optionType: 'string'
        }
    ],
    async run(i, client) {
        const options = i.options
        if (!i.guild) return
        const guild = client.guildsData.get(i.guild.id)
        if (guild == undefined) return

        const submissionId = options.getString('submissionid', true)
        const submitChannel = (await client.channels.fetch(guild.submitChannel)) as TextChannel

        let submissionMsg: Message
        let submissionLink = '(Link could not be generated)'

        try {
            submissionMsg = await submitChannel.messages.fetch(submissionId)
            submissionLink = `[Link](${submissionMsg.url})`

        } catch (e) {
        }

        const originalSubmission = await Submission.findById(submissionId).exec()

        // Gate to ensure submission exists
        if (!originalSubmission) {
            const rejectedSubmission = await Rejection.findById(submissionId).exec()
            if (rejectedSubmission) {
                return Responses.submissionHasAlreadyBeenDeclined(i)
            }

            return Responses.submissionNotFound(i)
        }

        // Gate to ensure submission belongs to the server that is trying to remove it
        if (originalSubmission.guildId != i.guild.id) {
            return Responses.purgePermissionDenied(i)
        }

        // Delete submission from the database
        await originalSubmission.deleteOne().catch((err: any) => {
            console.log(err)
            return Responses.errorGeneric(i, err)
        })

        // Update user's points
        // @ts-ignore
        const pointsIncrement = -originalSubmission.pointsTotal
        const buildingCountIncrement = (() => {
            switch (originalSubmission.submissionType) {
                case 'MANY':
                    return (
                        -(originalSubmission.smallAmt || 0) -
                        (originalSubmission.mediumAmt || 0) -
                        (originalSubmission.largeAmt || 0)
                    )
                case 'ONE':
                    return -1
                default:
                    return 0
            }
        })()
        // @ts-ignore
        const roadKMsIncrement = -originalSubmission.roadKMs || 0
        // @ts-ignore
        const sqmIncrement = -originalSubmission.sqm || 0

        await Builder.updateOne(
            { id: originalSubmission.userId, guildId: i.guild.id },
            {
                $inc: {
                    pointsTotal: pointsIncrement,
                    buildingCount: buildingCountIncrement,
                    roadKMs: roadKMsIncrement,
                    sqm: sqmIncrement
                }
            },
            { upsert: true }
        ).exec()

        // Remove all bot reactions, then add a '❌' reaction
        // @ts-ignore
        if (submissionMsg) {
            submissionMsg.reactions.cache.forEach((reaction) => reaction.remove())
        }

        // update reviewer
        await updateReviewerForPurge(originalSubmission)

        const dmsEnabled = await areDmsEnabled(originalSubmission.userId)

        // Send a DM to the user if user wants dms
        try {
            if (dmsEnabled) {
                // @ts-ignore
                const builder = submissionMsg.author
                const dm = await builder.createDM()

                await dm.send(Responses.createEmbed(
                    `__${submissionLink}__`,
                    `Your recent build submission has been removed.`
                )).catch((err) => {
                    return Responses.errorDirectMessaging(i, err)
                })
            }
        } catch (e) {
        }


        await Responses.submissionPurged(i, submissionLink)
    }
})
