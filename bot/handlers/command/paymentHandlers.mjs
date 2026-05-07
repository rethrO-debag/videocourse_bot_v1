import { bot } from '../../bot.mjs';

const BASIC_PRICE = 1000;
const MENTOR_PRICE = 1500;

export async function handlePaymentReceipt(msg, userService, paymentService) {
    try {
        const user = await userService.findByTelegramId(msg.from.id);
        if (!user) {
            return bot.bot.sendMessage(
                msg.chat.id, 
                'Пожалуйста, начните с регистрации через команду /start',
                {
                    protect_content: true
                }
            );
        }

        // Check for existing pending payment
        const existingPayment = await paymentService.findOne({
            user_id: user.id,
            status: 'pending'
        });
        
        if (existingPayment) {
            return bot.bot.sendMessage(
                msg.chat.id,
                '⏳ У вас уже есть отложенный платеж. Пожалуйста, дождитесь его обработки.',
                {
                    protect_content: true
                }
            );
        }

        const fileId = msg.document 
            ? msg.document.file_id 
            : msg.photo[msg.photo.length - 1].file_id;
            
        const fileType = msg.document ? 'document' : 'photo';

        const payment = await paymentService.create({
            user_id: user.id,
            receipt_file_id: fileId,
            file_type: fileType,
            status: 'pending',
            payment_method: 'bank_transfer',
            amount: user.with_mentor ? MENTOR_PRICE : BASIC_PRICE,
            course_type: user.with_mentor ? 'with_mentor' : 'basic'
        });

        await bot.bot.sendMessage(
            msg.chat.id,
            '✅ Ваша квитанция получена и отправлена на проверку. Пожалуйста, дождитесь подтверждения от модератора.',
            {
                protect_content: true
            }
        );

        await notifyModerator(payment, user);

    } catch (error) {
        console.error('Оплата за обработку ошибок:', error);
        await bot.bot.sendMessage(msg.chat.id, '⚠️ Ошибка при обработке платежа',
            {
                protect_content: true
            });
    }
}

async function notifyModerator(payment, user) {
    const caption = 
        `Новый платеж #${payment.id}\n` +
        `Пользователь: @${user.username || user.telegram_id}\n` +
        `Дата: ${new Date().toLocaleString()}`;

    try {
        const sentMessage = payment.file_type === 'document' 
            ? await bot.bot.sendDocument(process.env.ADMIN_CHAT_ID, payment.receipt_file_id, { caption })
            : await bot.bot.sendPhoto(process.env.ADMIN_CHAT_ID, payment.receipt_file_id, { caption });

        await bot.bot.sendMessage(
            process.env.ADMIN_CHAT_ID,
            'Select action:',
            {
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Принять', callback_data: `approve_payment|${payment.id}` },
                            { text: '❌ Отклонить', callback_data: `reject_payment|${payment.id}` },
                        ]
                    ]
                },
                reply_to_message_id: sentMessage.message_id
            }
        );
    } catch (error) {
        console.error('Модератор уведомляет об ошибке:', error);
    }
}