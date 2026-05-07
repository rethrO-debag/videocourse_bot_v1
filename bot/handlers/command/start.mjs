import { bot } from '../../bot.mjs';

export async function setupStartCommand(commandHandler, userService) {
    commandHandler.register('start', async (chatId, args, msg) => {
        try {
            const { user, created: isNew } = await userService.createOrUpdate(msg.from);
            
            if (isNew) {
                await bot.bot.sendMessage(
                    chatId,
                    `👋 Привет, ${user.first_name || 'друг'}!\n\n` +
                    'Чтобы получить доступ к курсу, пришлите мне фотографию или PDF-документ с подтверждением оплаты.\n\n' +
                    'После проверки модератором вы получите доступ к материалам курса.',
            {
                protect_content: true
            }
                );
            } else {
                await bot.bot.sendMessage(
                    chatId,
                    `👋 С возвращением, ${user.first_name || 'друг'}! Рад видеть тебя снова!\n\n` +
                    'Вы можете отправить новые подтверждения оплаты для проверки модератором.',
            {
                protect_content: true
            }
                );
            }
            
        } catch (error) {
            console.error('Ошибка в команде запуска:', error);
            await bot.bot.sendMessage(chatId, '⚠️ Команда обработки ошибок',
            {
                protect_content: true
            });
        }
    });
}