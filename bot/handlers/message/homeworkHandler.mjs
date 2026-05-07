import { bot } from '../../bot.mjs';
import { userStates } from '../command/help.mjs';

export async function handleHomeworkVideo(msg, userService) {
    try {
        const userId = msg.from.id;
        const homeworkState = userStates.awaitingHomework.get(userId);
        
        // Проверяем, ожидаем ли мы домашнее задание от этого пользователя
        if (!homeworkState) {
            return; // Не обрабатываем видео, если не было запроса
        }
        
        // Убираем состояние ожидания
        userStates.awaitingHomework.delete(userId);
        
        const user = await userService.findByTelegramId(userId);
        if (!user) return;
        
        // Проверяем, есть ли у пользователя доступ к ментору
        if (!user.with_mentor) {
            await bot.bot.sendMessage(
                msg.chat.id,
                '❌ У вас нет доступа к отправке домашних заданий',
            {
                protect_content: true
            }
            );
            return;
        }

        const videoFileId = msg.video.file_id;
        const lessonNumber = homeworkState.lessonNumber;

        await bot.bot.sendMessage(
            msg.chat.id,
            '✅ Ваше видео-домашнее задание принято! Куратор проверит его в течение 24 часов.',
            {
                protect_content: true
            }
        );
        
        // Отправка модератору
        const mentorChatId = process.env.ADMIN_CHAT_ID;

        await bot.bot.sendVideo(
            mentorChatId,
            videoFileId,
            {
                caption: `📬 Домашнее задание по уроку ${lessonNumber}\nОт: @${user.username || user.first_name}`,
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { 
                                text: '✅ Принять', 
                                callback_data: `accept_homework|${user.id}|${lessonNumber}` 
                            },
                            { 
                                text: '✏️ Запросить правки', 
                                callback_data: `request_feedback|${user.id}|${lessonNumber}` 
                            }
                        ]
                    ]
                }
            }
        );
        
    } catch (error) {
        console.error('Error handling homework video:', error);
        await bot.bot.sendMessage(msg.chat.id, '⚠️ Ошибка при обработке домашнего задания',
            {
                protect_content: true
            });
    }
}