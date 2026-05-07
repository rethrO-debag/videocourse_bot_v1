import { bot } from '../../bot.mjs';

export async function handleRejectHomework(callbackQuery, [userId, lessonNumber], userService) {
    try {
        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );
        
        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            `❌ Домашнее задание к уроку ${lessonNumber} отклонен`,
            {
                protect_content: true
            }
        );
        
        const user = await userService.findOne({ id: userId });
        if (!user) return;
        
        await bot.bot.sendMessage(
            user.telegram_id,
            `📝 Ваше домашнее задание к уроку ${lessonNumber} нуждается в пересмотре. ` +
            `Пожалуйста, просмотрите урок и повторно отправьте свое задание.`,
            {
                protect_content: true
            }
        );
        
        await bot.bot.sendMessage(
            user.telegram_id,
            '⬇️ Присылайте свое исправленное домашнее задание в виде видео:',
            {
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { 
                                text: '📤 Повторно отправьте домашнее задание', 
                                callback_data: 'submit_homework' 
                            }
                        ]
                    ]
                }
            }
        );
        
        await bot.bot.answerCallbackQuery(callbackQuery.id);
        
    } catch (error) {
        console.error('Ошибка при отклонении домашнего задания:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Запрос на обработку ошибки',
            show_alert: true
        });
    }
}