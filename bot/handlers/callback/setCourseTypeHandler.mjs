import { bot } from '../../bot.mjs';
import path from 'path';
import fs from 'fs';

export async function handleSetCourseType(callbackQuery, [paymentId, courseType], paymentService, userService) {
    try {
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: '⏳ Загрузка...',
            show_alert: false
        });
        
        const payment = await paymentService.findOne({ id: paymentId });
        if (!payment) throw new Error(`Платеж #${paymentId} не найдено`);
        
        const user = await userService.findOne({ id: payment.user_id });
        if (!user) throw new Error(`Пользователь для оплаты #${paymentId} не найдено`);
        
        // Обновляем платеж
        const paymentUpdated = await paymentService.update(
            { id: paymentId },
            { 
                course_type: courseType,
                status: 'approved' // Добавляем статус одобрения
            }
        );
        
        if (!paymentUpdated) {
            throw new Error('Не удалось обновить платеж');
        }
        
        // Обновляем пользователя - КОРРЕКТНЫЙ СИНТАКСИС
        const userUpdated = await userService.update(
            { id: user.id }, // Условие WHERE
            { // Данные для обновления
                has_access: true,
                access_granted_at: new Date(),
                with_mentor: courseType === 'with_mentor',
                active_payment_id: payment.id,
                current_lesson: 0
            }
        );
        
        if (!userUpdated) {
            throw new Error('Не удалось обновить данные пользователя');
        }
        
        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );
        
        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            `✅ Установленный тип доступа: ${courseType === 'with_mentor' ? 'with mentor' : 'basic'}`,
            {
                protect_content: true
            }
        );
        
        const introVideoPath = path.resolve(process.cwd(), 'videos', 'Вступительное слово.mp4');
        
        if (!fs.existsSync(introVideoPath)) {
            throw new Error('Вступительное видео не найдено');
        }
        
        await bot.bot.sendVideo(
            user.telegram_id,
            introVideoPath,
            {
                caption: '🎬 Вступительное видео',
                protect_content: true,
            }
        );

        await bot.bot.sendMessage(
            user.telegram_id,
            `Все домашние задания принимаются куратором только в видео формате, т е. Если домашнее задание написать список или описать ситуацию. то Вы отправляете видео в котором зачитываете домашнее задание.`.trim(),
            {
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { 
                                text: '▶️ Начинаем первый урок', 
                                callback_data: 'get_video_lesson' 
                            }
                        ]
                    ]
                }
            }
        );
        
    } catch (error) {
        console.error('Ошибка при настройке типа курса:', error);
        
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: `Ошибка: ${error.message}`,
            show_alert: true
        });
        
        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            `⚠️ Ошибка при настройке типа доступа: ${error.message}`,
            {
                protect_content: true
            }
        );
    }
}