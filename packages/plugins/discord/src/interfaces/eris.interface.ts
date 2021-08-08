export const ON_DISCORD = Symbol('onDiscord');

/**
 * Strip down the Eris Discord Client Events
 */
export type ClientEvents =
    | 'ready'
    | 'disconnect'
    | 'callCreate'
    | 'callRing'
    | 'callDelete'
    | 'callUpdate'
    | 'channelCreate'
    | 'channelPinUpdate'
    | 'channelRecipientAdd'
    | 'channelUpdate'
    | 'connect'
    | 'error'
    | 'friendSuggestionCreate'
    | 'friendSuggestionDelete'
    | 'guildBanAdd'
    | 'guildBanRemove'
    | 'guildAvailable'
    | 'guildCreate'
    | 'guildDelete'
    | 'guildEmojisUpdate'
    | 'guildMemberAdd'
    | 'guildMemberChunk'
    | 'guildMemberRemove'
    | 'guildMemberUpdate'
    | 'guildRoleCreate'
    | 'guildRoleUpdate'
    | 'guildUnavailable'
    | 'unavailableGuildCreate'
    | 'guildUpdate'
    | 'hello'
    | 'inviteCreate'
    | 'inviteDelete'
    | 'messageCreate'
    | 'messageDelete'
    | 'messageReactionRemoveEmoji'
    | 'messageDeleteBulk'
    | 'messageReactionAdd'
    | 'messageReactionRemove'
    | 'messageUpdate'
    | 'presenceUpdate'
    | 'rawREST'
    | 'rawWS'
    | 'unknown'
    | 'relationshipAdd'
    | 'relationshipRemove'
    | 'relationshipUpdate'
    | 'typingStart'
    | 'userUpdate'
    | 'voiceChannelJoin'
    | 'voiceChannelSwitch'
    | 'voiceStateUpdate'
    | 'warn'
    | 'debug'
    | 'webhooksUpdate'
    | 'shardReady'
    | 'shardResume'
    | 'shardDisconnect'
    | 'listener'
    | 'resume'
    | 'end'
    | 'start'
    | 'error'
    | 'connect'
    | 'debug'
    | 'disconnect'
    | 'error'
    | 'pong'
    | 'speakingStart'
    | 'speakingStop'
    | 'unknown';