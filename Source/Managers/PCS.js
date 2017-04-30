const Discord = require("discord.js");
const Collection = Discord.Collection;

class PCS {
    constructor(client) {
        this.client = client;
        this.connection = client.settingsManager.connection;

        this.data = new Collection();

        this.collect();
    }

    collect() {
        this.conection.query("SELECT * FROM pcs", (error, rows) => {
            if (error ||  !rows.length) return;

            rows.forEach(r => {
                if (this.data.has(r.id)) return this.data.set(this.data.get(r.id).push(r));
                return this.data.set([r]);
            });
        });
    }

    match(guild, text) {
        if (!list.has(guild)) return;
        let list = this.data.get(guild);

        let key = list.filter(d => d.trigger === text)[0];
        return key;
    }
}

module.exports = PCS;
