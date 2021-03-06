import Event from '../lib/structures/Event';
import { TypicalGuild } from '../lib/types/typicalbot';

export default class GuildCreate extends Event {
    async execute(guild: TypicalGuild) {
        if (!guild.available) return;

        if (!this.client.dev)
            await this.client.sendStatistics(guild.shardID);
    }
}
