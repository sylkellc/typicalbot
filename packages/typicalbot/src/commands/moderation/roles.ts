import Command from '../../structures/Command';
import Constants from '../../utility/Constants';
import { TypicalGuildMessage, PermissionLevel } from '../../types/typicalbot';
import { Role } from 'discord.js';

const regex = /(help|list|give|take|public|info|information)(?:\s+(.+))?/i;
const infoRegex = /(?:(members)\s+)?(?:(?:(?:<@&)?(\d{17,20})>?|(.+))\s+(\d+)|(?:(?:<@&)?(\d{17,20})>?|(.+)))/i;
const manageRegex = /(?:(?:(?:<@!?)?(\d{17,20})>?)|(?:(.+)#(\d{4})))\s+(?:(?:<@&)?(\d{17,20})>?|(.+))/i;
const publicRegex = /(list|add|remove|clear)(?:\s+(?:(?:<@&)?(\d{17,20})>?|(.+)))?/i;

export default class extends Command {
    aliases = ['role'];
    mode = Constants.Modes.STRICT;

    async execute(message: TypicalGuildMessage, parameters: string) {
        const args = regex.exec(parameters);
        if (!args)
            return message.error(
                message.translate('misc:USAGE_ERROR', {
                    name: this.name,
                    prefix: this.client.config.prefix
                })
            );
        args.shift();

        const permissions = await this.client.handlers.permissions.fetch(
            message.guild,
            message.author.id,
            true
        );

        const [subcommand, argument] = args;

        switch (subcommand) {
            case 'help':
                return this.help(message);
            case 'list':
                return this.list(message, argument);
            case 'info':
            case 'information':
                return this.info(message, argument);
            case 'give':
            case 'take':
                return this.manage(message, argument, permissions, subcommand);
            case 'public':
                return this.public(message, argument, permissions);
        }

        return null;
    }

    help(message: TypicalGuildMessage) {
        return message.send(
            [
                message.translate('help:TEXT_1', { name: this.name }),
                message.translate('help:TEXT_2'),
                message.translate('help:TEXT_3'),
                '```',
                message.translate('roles:HELP_LIST'),
                message.translate('roles:HELP_FIRST'),
                message.translate('roles:HELP_SECOND'),
                '',
                '```'
            ].join('\n')
        );
    }

    list(message: TypicalGuildMessage, page: string) {
        const content = this.client.helpers.pagify.execute(
            message.guild.roles
                .sort((a, b) => b.position - a.position)
                .map(
                    role =>
                        `${this.client.helpers.lengthen.execute(
                            role.name,
                            30
                        )} : ${role.id}`
                ),
            parseInt(page, 10) || 1
        );

        return message.send(
            [
                message.translate('roles:LIST', { name: message.guild.name }),
                '',
                '',
                '```autohotkey',
                ,
                content,
                '```'
            ].join('\n')
        );
    }

    async info(message: TypicalGuildMessage, argument: string) {
        const args = infoRegex.exec(argument);
        if (!args)
            return message.error(
                message.translate('misc:USAGE_ERROR', {
                    name: this.name,
                    prefix: this.client.config.prefix
                })
            );
        args.shift();

        const [action, roleMention, , page, roleID] = args;

        const role =
            roleMention || roleID
                ? message.guild.roles.get(roleMention || roleID)
                : // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                subArgs[3] || subArgs[6]
                ? message.guild.roles.find(r =>
                      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                      // @ts-ignore
                      subArgs[3]
                          ? // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                            // @ts-ignore
                            r.name.toLowerCase() === subArgs[3].toLowerCase()
                          : // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                            // @ts-ignore
                            r.name.toLowerCase() === subArgs[6].toLowerCase()
                  )
                : null;
        if (!role) return message.error(message.translate('give:INVALID'));

        if (action !== 'members') return null;

        await message.guild.members.fetch().catch(console.error);

        const content = this.client.helpers.pagify.execute(
            role.members.map(
                member =>
                    `${this.client.helpers.lengthen.execute(
                        member.user.username,
                        30
                    )} : ${member.id}`
            ),
            parseInt(page, 10) || 1
        );

        return message.send(
            [
                message.translate('roles:MEMBERS', {
                    name: message.guild.name
                }),
                '',
                '',
                '```autohotkey',
                content,
                '',
                '```'
            ].join('\n')
        );
    }

    async manage(
        message: TypicalGuildMessage,
        argument: string,
        permissions: PermissionLevel,
        subcommand = 'give'
    ) {
        if (permissions.level < 3)
            return message.error(
                this.client.helpers.permissionError.execute(
                    message,
                    this,
                    permissions
                )
            );

        const args = manageRegex.exec(argument);
        if (!args)
            return message.error(
                message.translate('misc:USAGE_ERROR', {
                    name: this.name,
                    prefix: this.client.config.prefix
                })
            );
        args.shift();

        const [id, username, discriminator, roleID, roleName] = args;

        const member = await this.client.helpers.resolveMember.execute(
            message,
            id,
            username,
            discriminator,
            false
        );
        if (!member)
            return message.error(message.translate('common:USER_FETCH_ERROR'));

        const role = roleID
            ? message.guild.roles.get(roleID)
            : roleName
            ? message.guild.roles.find(
                  r => r.name.toLowerCase() === roleName.toLowerCase()
              )
            : null;

        if (!role) return message.error(message.translate('give:INVALID'));

        if (!role.editable)
            return message.error(message.translate('give:UNEDITABLE'));

        if (message.member.roles.highest.position <= role.position)
            return message.error(
                message.translate(
                    subcommand === 'give' ? 'roles:GIVE' : 'roles:TAKE'
                )
            );

        const edited =
            subcommand === 'give'
                ? await member.roles.add(role).catch(() => null)
                : await member.roles.remove(role).catch(() => null);

        return edited
            ? message.reply(message.translate('common:SUCCESS'))
            : message.error(message.translate('common:REQUEST_ERROR'));
    }

    public(
        message: TypicalGuildMessage,
        argument: string,
        permissions: PermissionLevel
    ) {
        const args = publicRegex.exec(argument);
        if (!args)
            return message.error(
                message.translate('misc:USAGE_ERROR', {
                    name: this.name,
                    prefix: this.client.config.prefix
                })
            );
        args.shift();

        const [action, roleID, roleName] = args;

        const role = roleID
            ? message.guild.roles.get(roleID)
            : roleName
            ? message.guild.roles.find(
                  r => r.name.toLowerCase() === roleName.toLowerCase()
              )
            : null;

        switch (action) {
            case 'list':
                return this.listPublic(message, roleName);
            case 'add':
            case 'remove':
                return this.managePublic(message, role, permissions, action);
            case 'clear':
                return this.clearPublic(message, permissions);
        }

        return null;
    }

    listPublic(message: TypicalGuildMessage, page: string) {
        const roles: Role[] = [];

        for (const roleID of message.guild.settings.roles.public) {
            const role = message.guild.roles.get(roleID);
            if (!role) continue;
            roles.push(role);
        }

        if (!roles.length)
            return message.reply(message.translate('roles:NONE_PUBLIC'));

        const content = this.client.helpers.pagify.execute(
            roles
                .sort((a, b) => b.position - a.position)
                .map(
                    role =>
                        `${this.client.helpers.lengthen.execute(
                            role.name,
                            30
                        )} : ${role.id}`
                ),
            parseInt(page, 10) || 1
        );

        return message.send(
            [
                message.translate('roles:PUBLIC'),
                '',
                '',
                '```autohotkey',
                content,
                '',
                '```'
            ].join('\n')
        );
    }

    async managePublic(
        message: TypicalGuildMessage,
        role: Role | null | undefined,
        permission: PermissionLevel,
        subcommand = 'add'
    ) {
        if (permission.level < 3)
            return message.error(
                this.client.helpers.permissionError.execute(
                    message,
                    this,
                    permission
                )
            );

        if (!role) return message.error(message.translate('give:INVALID'));

        const roleIDs = message.guild.settings.roles.public.filter(r =>
            message.guild.roles.has(r)
        );
        if (subcommand === 'add') {
            if (roleIDs.includes(role.id))
                return message.error(message.translate('roles:ALREADY_PUBLIC'));

            roleIDs.push(role.id);
        } else {
            if (!roleIDs.includes(role.id))
                return message.error(message.translate('roles:NOT_PUBLIC'));

            roleIDs.splice(roleIDs.indexOf(role.id), 1);
        }

        const updated = await this.client.settings
            .update(message.guild.id, { roles: { public: roleIDs } })
            .catch(() => null);

        return updated
            ? message.reply(message.translate('common:SUCCESS'))
            : message.error(message.translate('common:REQUEST_ERROR'));
    }

    async clearPublic(
        message: TypicalGuildMessage,
        permission: PermissionLevel
    ) {
        if (permission.level < 3)
            return message.error(
                this.client.helpers.permissionError.execute(
                    message,
                    this,
                    permission
                )
            );

        const updated = await this.client.settings
            .update(message.guild.id, { roles: { public: [] } })
            .catch(() => null);

        return updated
            ? message.reply(message.translate('common:SUCCESS'))
            : message.error(message.translate('common:REQUEST_ERROR'));
    }
}
