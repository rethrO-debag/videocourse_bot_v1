//import { userService, paymentService } from '../../services/index.mjs';
import { bot } from '../../bot.mjs';

export async function handlePaymentReceipt(msg) {
    try {
        const user = await userService.findByTelegramId(msg.from.id);
        if (!user) {
        return bot.bot.sendMessage(msg.chat.id, 'Сначала зарегистрируйтесь через /start',
            {
                protect_content: true
            });
        }

        const fileId = msg.document 
        ? msg.document.file_id 
        : msg.photo[msg.photo.length - 1].file_id;
        
        const fileType = msg.document ? 'document' : 'photo';

        const payment = await paymentService.createPending(
        user.id,
        fileId,
        fileType
        );

        // Остальная логика...
    } catch (error) {
        console.error('Error handling payment:', error);
        await bot.bot.sendMessage(msg.chat.id, '⚠️ Ошибка обработки чека',
            {
                protect_content: true
            });
    }
}