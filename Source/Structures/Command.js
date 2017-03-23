class Command {
    constructor(client, {name, description, usage, aliases, dm, permission, mode}) {
        this.client = client;

        this.name = name || "NULL";

        this.description = description || "Description Not Provided";

        this.usage = usage || "Usage Not Provided";

        this.aliases = aliases || new Array();

        this.dm = dm || false;

        this.permission = permission || 0;

        this.mode = mode || "free";
    }
}

module.exports = Command;
