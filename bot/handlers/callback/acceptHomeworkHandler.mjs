import { bot } from '../../bot.mjs';

export async function handleAcceptHomework(callbackQuery, [userId, lessonNumber], userService) {
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
            `✅ Домашнее задание к уроку ${lessonNumber} принято`,
            {
                protect_content: true
            }
        );
        
        const user = await userService.findOne({ id: userId });
        if (!user) return;
        
        await bot.bot.sendMessage(
            user.telegram_id,
            `🎉 Ваше домашнее задание к уроку ${lessonNumber} было принято!`,
            {
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { 
                                text: '▶️ Получить следующее видео', 
                                callback_data: 'get_video_lesson' 
                            }
                        ]
                    ]
                }
            }
        );
        
        await bot.bot.answerCallbackQuery(callbackQuery.id);
        
    } catch (error) {
        console.error('Ошибка при приеме домашнего задания:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Запрос на обработку ошибки',
            show_alert: true
        });
    }
}