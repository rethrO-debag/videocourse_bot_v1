export class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
  }

  register(command, handler) {
    this.commands.set(command, handler);
    this.bot.onText(new RegExp(`^/${command}(?:@\\w+)?(?:\\s+(.+))?$`), (msg, match) => {
      const chatId = msg.chat.id;
      const args = match[1] ? match[1].split(' ') : [];
      
      try {
        handler(chatId, args, msg);
      } catch (error) {
        console.error(`Ошибка при выполнении команды /${command}:`, error);
        this.bot.sendMessage(chatId, '⚠️ Ошибка при выполнении команды',
            {
                protect_content: true
            });
      }
    });
  }
}