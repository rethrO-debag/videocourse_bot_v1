import { bot } from '../../bot.mjs';

export async function handleApprovePayment(callbackQuery, [paymentId], paymentService, userService) {
    try {
        const payment = await paymentService.findOne({ id: paymentId });
        if (!payment) throw new Error(`Платеж #${paymentId} не найден`);
        
        const user = await userService.findOne({ id: payment.user_id });
        if (!user) throw new Error(`Пользователь для оплаты #${paymentId} не найден`);
        
        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );
        
        await bot.bot.sendMessage(
            callbackQuery.message.chat.id,
            `Выберите тип доступа для оплаты #${paymentId}:`,
            {
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { 
                                text: 'Без куратора', 
                                callback_data: `set_course_type|${paymentId}|basic` 
                            },
                            { 
                                text: 'С куратором', 
                                callback_data: `set_course_type|${paymentId}|with_mentor` 
                            }
                        ]
                    ]
                }
            }
        );
        
        await bot.bot.answerCallbackQuery(callbackQuery.id);
        
    } catch (error) {
        console.error('Ошибка при подтверждении платежа:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: `Ошибка: ${error.message}`,
            show_alert: true
        });
    }
}