const Command = require("../../Structures/Command.js");
const RichEmbed = require("discord.js").RichEmbed;

module.exports = class extends Command {
    constructor(client, filePath) {
        super(client, filePath, {
            name: "subscribe",
            description: "Subscribe to TypicalBot's announcements.",
            usage: "subscribe",
            mode: "strict"
        });

        this.client = client;
    }

    execute(message, response, permissionLevel) {
        if (message.guild.id !== "163038706117115906") return response.error(`You must be in TypicalBot's Lounge in order to use this command.`);

        let Role = message.guild.roles.find("name", "Subscriber");

        message.member.addRole(Role).then(() => {
            response.reply("You are now subscribed to TypicalBot's announcements!");
        });
    }

    embedExecute(message, response, permissionLevel) {
        let fail = new RichEmbed()
        .setColor(0xFF0000)
        .setTitle("Error")
        .setDescription(`You must be in TypicalBot's Lounge in order to use this command.`)
        .setFooter("TypicalBot", "https://typicalbot.com/images/icon.png")
        .setTimestamp();

        let success = new RichEmbed()
        .setColor(0x00adff)
        .setTitle("Success")
        .setDescription("You are now subscribed to TypicalBot's announcements!")
        .setFooter("TypicalBot", "https://typicalbot.com/images/icon.png")
        .setTimestamp();

        if (message.guild.id !== "163038706117115906") return response.embed(fail);

        let Role = message.guild.roles.find("name", "Subscriber");

        message.member.addRole(Role).then(() => {
            response.embed(success);
        });
    }
};
