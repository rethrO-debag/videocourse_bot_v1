import { bot } from '../../bot.mjs';
import { userStates } from '../command/help.mjs';

export async function handleSubmitHomework(callbackQuery, userService) {
    try {
        const user = await userService.findByTelegramId(callbackQuery.from.id);
        if (!user) {
            await bot.bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Пользователь не найден',
                show_alert: true
            });
            return;
        }

        // Проверяем, есть ли у пользователя доступ к ментору
        if (!user.with_mentor) {
            await bot.bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ У вас нет доступа к отправке домашних заданий',
                show_alert: true
            });
            return;
        }

        // Устанавливаем состояние ожидания ДЗ
        userStates.awaitingHomework.set(callbackQuery.from.id, {
            userId: user.id,
            lessonNumber: user.current_lesson,
            timestamp: Date.now()
        });

        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );
        
        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            '📹 Пожалуйста, запишите и отправьте видео с вашим домашним заданием. ' +
            'Продолжительность: 1-3 минуты.\n\n' +
            'Ваш куратор проверит его и даст обратную связь.',
            {
                protect_content: true
            }
        );
        
    } catch (error) {
        console.error('Error handling homework submission:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Ошибка при обработке запроса',
            show_alert: true
        });
    }
}