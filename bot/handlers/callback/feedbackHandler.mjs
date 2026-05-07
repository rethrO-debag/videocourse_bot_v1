import { bot } from '../../bot.mjs';
import { feedbackRequests } from '../../services/feedbackState.mjs';

export async function handleRequestFeedback(callbackQuery, [userId, lessonNumber], userService) {
    try {
        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );
        
        feedbackRequests.set(callbackQuery.from.id, {
            userId,
            lessonNumber,
            messageId: callbackQuery.message.message_id
        });
        
        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            `✍️ Пожалуйста, оставьте отзыв для пользователя об уроке ${lessonNumber}:\n\n` +
            `(Это сообщение будет отправлено пользователю)`,
            {
                protect_content: true
            }
        );
        
    } catch (error) {
        console.error('Ошибка при запросе обратной связи:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Запрос на обработку ошибки',
            show_alert: true,
            protect_content: true
        });
    }
}

export async function handleFeedbackMessage(msg, userService) {
    try {
        const feedbackRequest = feedbackRequests.get(msg.from.id);
        if (!feedbackRequest) return;
        
        const { userId, lessonNumber, messageId } = feedbackRequest;
        const user = await userService.findOne({ id: userId });
        
        feedbackRequests.delete(msg.from.id);
        
        try {
            await bot.bot.deleteMessage(msg.chat.id, messageId);
        } catch (e) {}
        
        await bot.bot.sendMessage(
            user.telegram_id,
            `📝 Обратная связь по домашнему заданию (уроку ${lessonNumber}):\n\n${msg.text}\n\n` +
            `Пожалуйста, пересмотрите и отправьте свое домашнее задание повторно.`,
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
        
        await bot.bot.sendMessage(msg.chat.id, `✅ Обратная связь, отправленная пользователю`,
            {
                protect_content: true
            });
        await bot.bot.deleteMessage(msg.chat.id, msg.message_id);
        
    } catch (error) {
        console.error('Обратная связь при обработке ошибок:', error);
        await bot.bot.sendMessage(msg.chat.id, '⚠️ Обратная связь при обработке ошибок',
            {
                protect_content: true
            });
    }
}