import { bot } from '../../bot.mjs';
import path from 'path';
import fs from 'fs';

const LESSON_ORDER = [
    'Первый урок.mp4',
    'Второй урок.mp4',
    'Третий урок.mp4',
    'Четвертый урок.mp4',
    'Пятый урок.mp4',
    'заключительное слово.mp4'
];

const HOMEWORKS = [
    `📝 *Домашнее задание к Уроку 1:*\n\n` +
    `1. Найдите 10 минут тишины\n` +
    `2. Вспомните неудобную ситуацию\n` +
    `3. Определите свои чувства и мысли\n` +
    `4. Опишите внешние реакции\n` +
    `5. Подумайте о возможных альтернативных действиях\n` +
    `6. Проанализируйте последствия сокрытия своих чувств`,
    
    `📝 *Домашнее задание к Уроку 2:*\n\n` +
    `1. Составьте список из 10 качеств, которые делают вас интересным\n` +
    `2. Получите обратную связь от 10 знакомых\n` +
    `3. Вспомните 2–3 ситуации, где ваши качества помогли\n` +
    `4. Запишите 1–2-минутное видео о своих сильных сторонах`,

    `📝 *Домашнее задание к Уроку 3:*\n\n` +
    `1. Вспомните пять последних комментариев о себе\n` +
    `2. Определите, были ли они конструктивными или негативными\n` +
    `3. Приведите два примера отзывов, которые на вас повлияли\n` +
    `4. Ответьте на вопросы для анализа`,

    `📝 *Домашнее задание к Уроку 4:*\n\n` +
    `1. Попробуйте техники эмоционального комфорта\n` +
    `2. Составляйте мини-отчёты после появления симптомов\n` +
    `3. Разработайте антикризисный чек-лист`,

    `📝 *Домашнее задание к Уроку 5:*\n\n` +
    `1. Ведите дневник эмоций\n` +
    `2. Запишите 2-минутное видео «Мой главный инсайт по курсу»\n` +
    `3. Ответьте на вопросы для саморефлексии`,

    `🎉 Поздравляем с завершением курса!`
];

export async function handleGetVideoLesson(callbackQuery, userService) {
    let videoStream = null;
    
    try {
        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );

        const user = await userService.findByTelegramId(callbackQuery.from.id);
        if (!user) {
            return await bot.bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Вы еще не зарегистрированы. Начать с /start',
                show_alert: true
            });
        }

        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: '⏳ Загрузка видео...',
            show_alert: false
        });

        if (user.current_lesson >= LESSON_ORDER.length) {
            return await sendCourseCompletion(user.telegram_id);
        }

        const videoName = LESSON_ORDER[user.current_lesson];
        const videoPath = path.resolve(process.cwd(), 'videos', videoName);

        if (!fs.existsSync(videoPath)) {
            throw new Error(`Видео "${videoName}" не найдено`);
        }

        videoStream = fs.createReadStream(videoPath);
        
        // Send video
        await bot.bot.sendVideo(
            callbackQuery.message.chat.id,
            videoStream,
            {
                caption: `🎬 ${videoName.replace('.mp4', '')}`,
                parse_mode: 'Markdown',
                protect_content: true
            }
        );

        // Send homework
        if (user.current_lesson < HOMEWORKS.length) {
            await bot.bot.sendMessage(
                callbackQuery.message.chat.id,
                HOMEWORKS[user.current_lesson],
                { 
                    protect_content: true,
                    parse_mode: 'Markdown' 
                }
            );
        }

        // Update user progress
        await userService.update(
            { id: user.id },
            { 
                current_lesson: user.current_lesson + 1,
                last_video_request: new Date()
            }
        );

        // Handle course completion
        if (user.current_lesson === LESSON_ORDER.length - 1) {
            return await sendCourseCompletion(user.telegram_id);
        }

        // Next action buttons
        const replyMarkup = {
            inline_keyboard: [
                [
                    {
                        text: user.with_mentor 
                            ? '📤 Отправить домашнее задание (видео)' 
                            : '▶️ Получить следующее видео',
                        callback_data: user.with_mentor 
                            ? 'submit_homework' 
                            : 'get_video_lesson'
                    }
                ]
            ]
        };

        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            user.with_mentor 
                ? '📝 После изучения урока отправьте видео-домашнее задание куратору:' 
                : '⬇️ Перейдите к следующему уроку:',
            {
                protect_content: true,
                reply_markup: replyMarkup
            }
        );

    } catch (error) {
        console.error('Ошибка в уроке handleGetVideoLesson:', error);
        videoStream?.destroy();

        // Resend video button on error
        const replyMarkup = {
            inline_keyboard: [
                [
                    {
                        text: '🔄 Попробуйте отправить видео еще раз',
                        callback_data: 'get_video_lesson'
                    }
                ]
            ]
        };

        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            `⚠️ Ошибка при загрузке видео:`,
            {
                protect_content: true,
                reply_markup: replyMarkup 
            }
        );
    }
}

async function sendCourseCompletion(chatId) {
    await bot.bot.sendMessage(
        chatId,
        '🎉 Поздравляю! Вы успешно завершили курс обучения.\n\n' +
        'Присоединяйтесь к нашему сообществу Telegram для получения поддержки и общения:\n' +
        '👉 https://t.me/provakativka',
        {
            protect_content: true,
            reply_markup: {
                inline_keyboard: [
                    [
                        { 
                            text: '✅ Присоединяйтесь к сообществу', 
                            url: 'https://t.me/provakativka' 
                        }
                    ]
                ]
            }
        }
    );
}