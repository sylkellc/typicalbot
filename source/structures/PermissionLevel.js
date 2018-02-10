const Constants = require("../utility/Constants");

class PermissionLevel {
    constructor(level, title, check) {
        this.level = level;

        this.title = title;

        this.check = check || (() => { return true; });
    }

    static fetchRoles(guild, permission) {
        const setting = guild.settings.roles[permission];

        const pool = setting.filter(r => guild.roles.has(r));
        
        const permRole = guild.roles.find(r => r.name.toLowerCase() === Constants.Permissions.RoleTitles[permission.toUpperCase()]);
        if (permRole) pool.push(permRole.id);

        return pool;
    }
}

module.exports = PermissionLevel;