import { bot } from '../../bot.mjs';

export async function handleRejectPayment(callbackQuery, [paymentId], paymentService, userService) {
    try {

        const payment = await paymentService.findOne({ id: paymentId });
        if (!payment) throw new Error(`Платеж #${paymentId} не найден`);
        
        const user = await userService.findOne({ id: payment.user_id });
        if (!user) throw new Error(`Пользователь для оплаты #${paymentId} не найден`);

        await paymentService.update(
            { id: paymentId },
            { status: 'rejected' }
        );
        
        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            }
        );

        await bot.bot.sendMessage(
            user.telegram_id,
            '❌ Ваш платеж был отклонен. Пожалуйста, проверьте вашу квитанцию и повторите попытку.',
            {
                protect_content: true
            }
        );
        
        await bot.bot.answerCallbackQuery(callbackQuery.id);
        
    } catch (error) {
        console.error('Ошибка при отклонении платежа:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Ошибка при отклонении платежа',
            show_alert: true
        });
    }
}