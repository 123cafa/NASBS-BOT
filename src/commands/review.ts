import Command from '../struct/Command.js'
import Submission, { SubmissionInterface } from '../struct/Submission.js'
import { globalArgs, landArgs, manyArgs, oneArgs, roadArgs } from '../review/options.js'
import { checkForRankup } from '../review/checkForRankup.js'
import { GuildMember, Message, TextChannel } from 'discord.js'
import { checkIfRejected } from '../utils/checkForSubmission.js'
import validateFeedback from '../utils/validateFeedback.js'
import { addReviewToDb } from '../review/addReviewToDb.js'
import { sendDm } from '../review/sendDm.js'
import { addCheckmarkReaction } from '../review/addCheckmarkReaction.js'
import { updateReviewerForAcceptance } from '../review/updateReviewer.js'
import Responses from '../utils/responses.js'

export default new Command({
    name: 'review',
    description: 'review builds.',
    reviewer: true,
    subCommands: [
        {
            name: 'one',
            description: 'Review one building.',
            args: [...globalArgs.slice(0, 1), ...oneArgs, ...globalArgs.slice(1)]
        },
        {
            name: 'many',
            description: 'Review multiple buildings.',
            args: [...globalArgs.slice(0, 1), ...manyArgs, ...globalArgs.slice(1)]
        },
        {
            name: 'land',
            description: 'Review land.',
            args: [...globalArgs.slice(0, 1), ...landArgs, ...globalArgs.slice(1)]
        },
        {
            name: 'road',
            description: 'Review road',
            args: [...globalArgs.slice(0, 1), ...roadArgs, ...globalArgs.slice(1)]
        }
    ],
    async run(i, client) {
        const options = i.options
        if (!i.guild) return
        const guildData = client.guildsData.get(i.guild.id)
        if (guildData == undefined) return

        const submitChannel = (await i.guild.channels.fetch(
            guildData.submitChannel
        )) as TextChannel //await client.channels.fetch(guildData.submitChannel)
        const submissionId = options.getString('submissionid', true)
        const feedback = validateFeedback(options.getString('feedback', true))
        const isEdit = options.getBoolean('edit') || false
        let submissionMsg: Message

        try {
            submissionMsg = await submitChannel.messages.fetch(submissionId)
        } catch (e) {
            return Responses.invalidSubmissionID(i, submissionId)
        }

        if (submissionMsg.author.id == i.user.id) {
            return Responses.submissionPermissionDenied(i)
        }

        // Check if it already got declined / purged
        const isRejected = await checkIfRejected(submissionId)

        // Check if it already got accepted
        const originalSubmission = await Submission.findById(submissionId).exec()

        if (isEdit && originalSubmission == null && !isRejected) {
            return Responses.submissionHasNotBeenReviewed(i)
        } else if (!isEdit && originalSubmission) {
            return Responses.submissionHasAlreadyBeenAccepted(i)
        } else if (isRejected) {
            return Responses.submissionHasAlreadyBeenDeclined(i)
        }

        // set variables shared by all subcommands
        const builderId = submissionMsg.author.id
        const bonus = options.getNumber('bonus') || 1
        const collaborators = options.getInteger('collaborators') || 1
        let pointsTotal: number
        let submissionData: SubmissionInterface = {
            _id: submissionId,
            guildId: i.guild.id,
            userId: builderId,
            collaborators: collaborators,
            bonus: bonus,
            edit: isEdit,
            submissionTime: submissionMsg.createdTimestamp,
            reviewTime: i.createdTimestamp,
            reviewer: i.user.id,
            feedback: feedback
        }

        // get builder as member using fetch, not from msg.member because that's bad
        let builder: GuildMember
        try {
            builder = await i.guild.members.fetch(builderId)
        } catch (e) {
        }

        // @ts-ignore
        if (!builder) return

        // subcommands
        if (i.options.getSubcommand() == 'one') {
            // set subcmd-specific variables
            const size = options.getInteger('size', true)
            const quality = options.getNumber('quality', true)
            const complexity = options.getNumber('complexity', true)
            let sizeName: string
            pointsTotal = (size * quality * complexity * bonus) / collaborators
            submissionData = {
                ...submissionData,
                submissionType: 'ONE',
                size: size,
                quality: quality,
                complexity: complexity,
                pointsTotal: pointsTotal
            }

            switch (size) {
                case 2:
                    sizeName = 'small'
                    break
                case 5:
                    sizeName = 'medium'
                    break
                case 10:
                    sizeName = 'large'
                    break
                case 20:
                    sizeName = 'monumental'
                    break
                default:
                    sizeName = ''
            }
            const reply = `gained **${pointsTotal} points!!!**
            
            *__Points breakdown:__*
            Building type: ${sizeName}
            Quality multiplier: x${quality}
            Complexity multiplier: x${complexity}
            Bonuses: x${bonus}
            Collaborators: ${collaborators}
            [Link](${submissionMsg.url})
            
            __Feedback:__ \`${feedback}\``

            // do review things
            await checkForRankup(builder, guildData, i)
            await addReviewToDb(
                reply,
                submissionData,
                'buildingCount',
                1,
                originalSubmission,
                i
            )
            await checkForRankup(builder, guildData, i)
            // @ts-ignore
            await updateReviewerForAcceptance(originalSubmission, submissionData, i)
            await sendDm(builder, guildData, reply, i)
            await addCheckmarkReaction(submissionMsg)
        } else if (i.options.getSubcommand() == 'many') {
            const smallAmt = options.getInteger('smallamt', true)
            const mediumAmt = options.getInteger('mediumamt', true)
            const largeAmt = options.getInteger('largeamt', true)
            const quality = options.getNumber('avgquality', true)
            const complexity = options.getNumber('avgcomplexity', true)
            pointsTotal =
                ((smallAmt * 2 + mediumAmt * 5 + largeAmt * 10) *
                    quality *
                    complexity *
                    bonus) /
                collaborators

            submissionData = {
                ...submissionData,
                smallAmt: smallAmt,
                mediumAmt: mediumAmt,
                largeAmt: largeAmt,
                quality: quality,
                complexity: complexity,
                submissionType: 'MANY',
                pointsTotal: pointsTotal
            }
            const reply = `gained **${pointsTotal} points!!!**
            
            *__Points breakdown:__*
            Number of buildings (S/M/L): ${smallAmt}/${mediumAmt}/${largeAmt}
            Quality multiplier: x${quality}
            Complexity multiplier: x${complexity}
            Bonuses: x${bonus}
            [Link](${submissionMsg.url})
            
            __Feedback:__ \`${feedback}\``

            // do review things
            await checkForRankup(builder, guildData, i)
            await addReviewToDb(
                reply,
                submissionData,
                'buildingCount',
                smallAmt + mediumAmt + largeAmt,
                originalSubmission,
                i
            )
            // @ts-ignore
            await updateReviewerForAcceptance(originalSubmission, submissionData, i)
            await sendDm(builder, guildData, reply, i)
            await addCheckmarkReaction(submissionMsg)
        } else if (i.options.getSubcommand() == 'land') {
            const sqm = options.getNumber('sqm', true)
            const landtype = options.getInteger('landtype', true)
            const quality = options.getNumber('quality', true)
            const complexity = options.getNumber('complexity', true)
            pointsTotal =
                (sqm * landtype * complexity * quality * bonus) / 100000 / collaborators
            submissionData = {
                ...submissionData,
                sqm: sqm,
                complexity: complexity,
                submissionType: 'LAND',
                quality: quality,
                pointsTotal: pointsTotal
            }

            const reply = `gained **${pointsTotal} points!!!**
            
            *__Points breakdown:__*
            Land area: ${sqm} sqm
            Quality multiplier: x${quality}
            Complexity multiplier: x${complexity}
            Bonuses: x${bonus}
            Collaborators: ${collaborators}
            [Link](${submissionMsg.url})
            
            __Feedback:__ \`${feedback}\``

            // do review things
            await checkForRankup(builder, guildData, i)
            await addReviewToDb(reply, submissionData, 'sqm', sqm, originalSubmission, i)
            // @ts-ignore
            await updateReviewerForAcceptance(originalSubmission, submissionData, i)
            await sendDm(builder, guildData, reply, i)
            await addCheckmarkReaction(submissionMsg)
        } else if (i.options.getSubcommand() == 'road') {
            const roadType = options.getNumber('roadtype', true)
            const roadKMs = options.getNumber('distance', true)
            const quality = options.getNumber('quality', true)
            const complexity = options.getNumber('complexity', true)
            pointsTotal = (roadType * roadKMs * complexity * quality * bonus) / collaborators
            submissionData = {
                ...submissionData,
                roadType: roadType,
                roadKMs: roadKMs,
                complexity: complexity,
                submissionType: 'ROAD',
                quality: quality,
                pointsTotal: pointsTotal
            }

            const reply = `gained **${pointsTotal} points!!!**
            
            *__Points breakdown:__*
            Road type: ${roadType}
            Quality multiplier: x${quality}
            Complexity multiplier: x${complexity}
            Distance: ${roadKMs} km
            Bonuses: x${bonus}
            Collaborators: ${collaborators}
            [Link](${submissionMsg.url})
            
            Feedback: \`${feedback}\``

            // do review things
            await checkForRankup(builder, guildData, i)
            await addReviewToDb(
                reply,
                submissionData,
                'roadKMs',
                roadKMs,
                originalSubmission,
                i
            )
            // @ts-ignore
            await updateReviewerForAcceptance(originalSubmission, submissionData, i)
            await sendDm(builder, guildData, reply, i)
            await addCheckmarkReaction(submissionMsg)
        }
    }
})
