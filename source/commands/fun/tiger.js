const Command = require("../../structures/Command");
const request = require("superagent");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Gives you a random tiger picture.",
            usage: "tiger"
        });
    }

    execute(message, parameters, permissionLevel) {
        request.get("https://typicalbot.com/api/tiger/")
            .end((err, res) => {
                if (err) return message.error("An error occured making that request.");

                return message.send(JSON.parse(res.text).response);
            });
    }

    embedexecute(message, parameters, permissionLevel) {
        request.get("https://typicalbot.com/api/tiger/")
            .end((err, res) => {
                if (err) return message.error("An error occured making that request.");

                return message.buildEmbed().setColor(0x00adff).setImage(JSON.parse(res.text).response).send();
            });
    }
};
