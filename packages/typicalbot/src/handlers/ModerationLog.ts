import { Guild, TextChannel, User } from 'discord.js';
import ModerationLog from '../structures/ModerationLog';
import Cluster from '..';
import { TypicalGuildMessage } from '../types/typicalbot';

export default class ModerationLogHandler {
    client: Cluster;

    constructor(client: Cluster) {
        this.client = client;
    }

    async fetchChannel(guild: Guild) {
        const settings = await this.client.settings.fetch(guild.id);

        if (!settings.logs.moderation)
            throw 'No moderation log channel is set.';
        if (!guild.channels.has(settings.logs.moderation))
            throw 'Channel does not exist.';

        return guild.channels.get(settings.logs.moderation) as TextChannel;
    }

    async fetchCase(guild: Guild, id = 'latest') {
        const channel = await this.fetchChannel(guild);

        const messages = await channel.messages
            .fetch({ limit: 100 })
            .catch(() => {
                throw "Couldn't fetch messages.";
            });

        for (const message of messages.values()) {
            // TODO: fix this if discord.js fixes partials
            if (!message.author) continue;

            if (
                message.author.id !==
                    (this.client.user && this.client.user.id) ||
                !message.embeds.length
            )
                continue;

            const [embed] = message.embeds;

            if (embed.type !== 'rich' || !embed.footer || !embed.footer.text)
                continue;

            if (!embed.footer.text.startsWith('Case ')) continue;

            if (id === 'latest') return message;
            if (embed.footer.text === `Case ${id}`) return message;
        }

        return null;
    }

    buildCase(message: TypicalGuildMessage, guild: Guild) {
        return new ModerationLog(this.client, message, guild);
    }

    edit(message: TypicalGuildMessage, moderator: User, reason: string) {
        const [embed] = message.embeds;

        const start = embed.description.substring(
            0,
            embed.description.lastIndexOf('\n')
        );

        return message.edit(
            embed
                .setAuthor(moderator.tag, moderator.displayAvatarURL())
                .setDescription([
                    start,
                    message.translate('modlog:REASON', {
                        reason
                    })
                ])
        );
    }
}
