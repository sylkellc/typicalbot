import Command from '../../structures/Command';
import Constants from '../../utility/Constants';
import { TypicalGuildMessage } from '../../types/typicalbot';

const characters = [
    '!',
    '"',
    '#',
    '$',
    '%',
    '&',
    "'",
    '(',
    ')',
    '*',
    '+',
    ',',
    '-',
    '.',
    '/',
    '[',
    ']'
];

export default class extends Command {
    permission = Constants.PermissionsLevels.SERVER_ADMINISTRATOR;
    mode = Constants.Modes.STRICT;

    execute(message: TypicalGuildMessage) {
        const list = [];
        for (const member of message.guild.members.values()) {
            if (!characters.includes(member.displayName[0])) continue;
            list.push(`» ${member.displayName} (${member.id})`);
        }

        message.send(
            list.length
                ? message.translate('dehoist:FOUND', {
                      amount: message.translate(
                          list.length === 1
                              ? 'dehoist:ONE'
                              : 'dehoist:MULTIPLE',
                          { amount: list.length }
                      ),
                      list: list.join('\n\n').substring(0, 2000)
                  })
                : message.translate('dehoist:NONE')
        );
    }
}