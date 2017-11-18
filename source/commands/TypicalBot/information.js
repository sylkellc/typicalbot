const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Get general information about TypicalBot.",
            aliases: ["info"],
            usage: "information",
            dm: true,
            mode: "strict"
        });
    }

    execute(message, permissionLevel) {
        message.send(`**Hello, I'm TypicalBot!** I was created by HyperCoder#2975. You can get a list of my commands with \`${this.client.config.prefix}commands\` and my documentation can be found at <${this.client.config.urls.docs}>. If you need help, join us in the TypicalBot Lounge at <${this.client.config.urls.server}>.`);
    }

    embedExecute(message, response){
        message.buildEmbed()
            .setColor(0x00ADFF)
            .setTitle("TypicalBot Information")
            .setDescription(`**Hello, I'm TypicalBot!** I was created by HyperCoder#2975. You can get a list of my commands with \`${this.client.config.prefix}commands\` and my documentation can be found at <${this.client.config.urls.docs}>. If you need help, join us in the TypicalBot Lounge at <${this.client.config.urls.server}>.`)
            .setFooter("TypicalBot", "https://typicalbot.com/x/images/icon.png")
            .setTimestamp()
            .send();
    }
};
