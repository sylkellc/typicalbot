const Event = require("../structures/Event");
const Constants = require(`../utility/Constants`);

class New extends Event {
    constructor(...args) {
        super(...args);
    }

    async execute(guild, user) {
        if (!guild.available) return;
        
        const settings = await this.client.settings.fetch(guild.id);

        if (settings.logs.moderation && !this.client.softbanCache.has(user.id)) {
            const cachedLog = this.client.unbanCache.get(user.id);

            this.client.moderationLog.createLog(guild, Object.assign({ action: Constants.ModerationLog.Types.UNBAN, user }, cachedLog));
            this.client.unbanCache.delete(user.id);
        }

        if (!settings.logs.id || settings.logs.unban === "--disabled") return;

        if (!guild.channels.has(settings.logs.id)) return;
        const channel = guild.channels.get(settings.logs.id);

        if (settings.logs.unban === "--embed") {
            channel.buildEmbed()
                .setColor(0x3EA7ED)
                .setAuthor(`${user.tag} (${user.id})`, user.avatarURL() || null)
                .setFooter("User Unbanned")
                .setTimestamp()
                .send()
                .catch(() => { return; });
        } else {
            channel.send(
                settings.logs.unban ?
                    this.client.functions.formatMessage("logs", guild, user, settings.logs.unban) :
                    `**${user.tag}** has been unbanned from the server.`
            ).catch(() => { return; });
        }
    }
}

module.exports = New;
