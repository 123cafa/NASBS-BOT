import { CacheType, ChatInputCommandInteraction, CommandInteraction, EmbedBuilder } from 'discord.js'

namespace Responses {

    // SUBMISSION AREA


    export function invalidSubmissionID(interaction: ChatInputCommandInteraction<CacheType>, submissionID: string) {
        return embed(interaction, `'${submissionID}' is not a valid message ID from the build submit channel.`)
    }

    export function submissionHasAlreadyBeenAccepted(interaction: ChatInputCommandInteraction<CacheType>) {
        return embed(interaction, `That submission has already been accepted.`)
    }

    export function submissionHasAlreadyBeenDeclined(interaction: ChatInputCommandInteraction<CacheType>) {
        return embed(interaction, `That submission has already been declined.`)
    }

    export function submissionHasNotBeenReviewed(interaction: ChatInputCommandInteraction<CacheType>) {
        return embed(interaction, `That submission has not been reviewed yet.`)
    }

    export function submissionNotFound(interaction: ChatInputCommandInteraction<CacheType>) {
        return embed(interaction, `Could not find a submission with that ID.`)
    }

    export function submissionRejected(interaction: any, feedback: any, url: any) {
        return embed(interaction,
            `Submission has been declined.
            \`${feedback}\`
            __[Submission link](<${url}>)__`
        )
    }

    export function submissionPurged(interaction: ChatInputCommandInteraction<CacheType>, link: string) {
        return embed(interaction, `Submission has been purged. ${link}`)
    }

    export function submissionPermissionDenied(interaction: ChatInputCommandInteraction<CacheType>) {
        return embed(interaction, `You cannot review a submission you submitted.`)
    }

    //

    export function purgePermissionDenied(interaction: ChatInputCommandInteraction<CacheType>) {
        return embed(interaction, `That submission belongs to another server, and you do not have permission to purge it.`)
    }

    // ERROR AREA

    export function errorDirectMessaging(interaction: ChatInputCommandInteraction<CacheType>, error: any) {
        return embed(interaction, `Something went wrong while sending the dm: ${error}`)
    }

    export function errorGeneric(interaction: CommandInteraction<CacheType>, error: unknown) {
        return embed(interaction, `Something went wrong: ${error}`)
    }

    //

    export function noCompletedBuilds(interaction: ChatInputCommandInteraction<CacheType>, username: string) {
        return embed(interaction, `\`${username}\` has no completed builds!`)
    }

    export function points(interaction: ChatInputCommandInteraction<CacheType>, userID: string, points: any, buildings: any, landMeters: any, roadKMs: any, emoji: string | undefined, guildName: string) {
        return embed(interaction,
            `<@${userID}> has :tada: ***${formatNumber(points)}***  :tada: points in ${emoji} ${guildName} ${emoji}!!
            
            Number of buildings: :house: ***${buildings}***  :house:
            Sqm of land: :corn: ***${formatNumber(landMeters)}***  :corn:
            Kilometers of roads: :motorway: ***${formatNumber(roadKMs)}***  :motorway:`,
            `Points`
        )
    }

    export function serverCompletedBuilds(interaction: ChatInputCommandInteraction<CacheType>, numberBuilds: number) {
        return embed(interaction,
            `This server has ${numberBuilds} completed buildings.`,
            `Server Progress`
        )
    }

    export function feedbackSent(interaction: ChatInputCommandInteraction<CacheType>, feedback: any, url: string) {
        return embed(interaction,
            `Feedback sent.
            \`${feedback}\`
            __[Submission link](<${url}>)__`
        )
    }

    export function dmPreferenceUpdated(interaction: ChatInputCommandInteraction<CacheType>, value: boolean | null) {
        return embed(interaction, `DM preference set to ${value ? 'enabled' : 'disabled'}`)
    }

    // UTIL AREA

    export function embed(interaction: CommandInteraction<CacheType>, message: string, title = '') {
        return interaction.editReply(createEmbed(message, title))
    }

    export function createEmbed(message: string | null, title = '') {
        if (title != '') return createEmbedWithTitle(title, message)

        return { embeds: [new EmbedBuilder().setDescription(message)] }
    }

    function createEmbedWithTitle(title: string | null, message: string | null) {
        return { embeds: [new EmbedBuilder().setTitle(title).setDescription(message)] }
    }

    function formatNumber(num: number) {
        return num.toFixed(2).replace(/[.,]00$/, '')
    }
}

export default Responses