import { bot } from '../../bot.mjs';

export const userStates = {
    awaitingHelpMessage: new Set(),
    pendingHelpRequests: new Map(),
    awaitingHomework: new Map()
};

export const curatorStates = {
    activeSessions: new Map()
};

export async function requestCuratorHelp(userChatId, user, message) {
    const CURATOR_CHAT_ID = process.env.ADMIN_CHAT_ID;

    try {
        const requestId = Date.now();

        const sentMsg = await bot.bot.sendMessage(
            CURATOR_CHAT_ID,
            `🆘 Запрос помощи #${requestId}\n\n` +
            `👤 ${user.first_name || 'Пользователь'} (ID: ${user.id})\n` +
            `📝 Сообщение:\n${message}`,
            {
                protect_content: true,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Ответить пользователю',
                            callback_data: `reply_to_help|${userChatId}|${requestId}`
                        }]
                    ]
                }
            }
        );

        userStates.pendingHelpRequests.set(userChatId, {
            userId: user.id,
            userChatId,
            originalMessage: message,
            requestId,
            messageId: sentMsg.message_id,
            chatId: CURATOR_CHAT_ID
        });

        await bot.bot.sendMessage(
            userChatId,
            '✅ Ваш запрос отправлен куратору. Ожидайте ответа.',
            {
                protect_content: true
            }
        );

    } catch (error) {
        console.error('Ошибка при отправке запроса куратору:', error);
        await bot.bot.sendMessage(
            userChatId,
            '⚠️ Не удалось отправить запрос. Попробуйте позже.',
            {
                protect_content: true
            }
        );
    }
}

// ВОССТАНОВЛЕННАЯ ФУНКЦИЯ
export async function sendReplyToUser(msg, requestData, userService) {
    const { userId, userChatId, originalMessage, requestId, messageId, chatId } = requestData;

    try {
        const user = await userService.findOne({ id: userId });
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // Отправляем ответ пользователю
        await bot.bot.sendMessage(
            userChatId,
            `📩 Ответ на ваш запрос #${requestId}:\n\n` +
            `Ваш запрос: "${originalMessage}"\n\n` +
            `Ответ куратора:\n${msg.text}`
        );

        // Обновляем сообщение у куратора
        try {
            await bot.bot.editMessageText(
                `✅ ОТВЕЧЕНО: Запрос помощи #${requestId}\n\n` +
                `👤 ${user.first_name || 'Пользователь'} (ID: ${user.id})\n` +
                `📝 Сообщение:\n${originalMessage}\n\n` +
                `💬 Ответ куратора:\n${msg.text}`,
                { 
                    chat_id: chatId, 
                    message_id: messageId 
                }
            );
        } catch (editError) {
            console.warn('Could not edit help request message:', editError);
            await bot.bot.sendMessage(
                chatId,
                `✅ Ответ на запрос #${requestId} был отправлен пользователю.\n\n` +
                `💬 Ваш ответ:\n${msg.text}`,
                {
                    protect_content: true
                }
            );
        }

    } catch (error) {
        console.error('Error sending reply to user:', error);
        await bot.bot.sendMessage(
            msg.chat.id,
            '⚠️ Ошибка при отправке ответа пользователю',
            {
                protect_content: true
            }
        );
    }
}

export async function handleReplyToHelp(callbackQuery, params) {
    try {
        const [userChatId, requestId] = params;
        const curatorId = callbackQuery.from.id;
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        const request = userStates.pendingHelpRequests.get(parseInt(userChatId));
        if (!request || request.requestId != parseInt(requestId)) {
            await bot.bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Этот запрос уже обработан',
                show_alert: true
            });
            return;
        }

        await bot.bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { 
                chat_id: chatId, 
                message_id: messageId 
            }
        );

        userStates.pendingHelpRequests.delete(parseInt(userChatId));
        curatorStates.activeSessions.set(curatorId, request);

        await bot.bot.sendMessage(
            chatId,
            `✍️ Введите ответ для пользователя (запрос #${requestId}):`,
            {
                protect_content: true,
                reply_to_message_id: messageId
            }
        );

        await bot.bot.answerCallbackQuery(callbackQuery.id);

    } catch (error) {
        console.error('Error handling help reply callback:', error);
        await bot.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Ошибка при обработке запроса'
        });
    }
}

export async function setupHelpCommand({ commandHandler }, userService) {
    commandHandler.register('help', async (chatId, args, msg) => {
        try {
            const { user } = await userService.createOrUpdate(msg.from);

            if (args.length > 0) {
                await requestCuratorHelp(chatId, user, args.join(' '));
                return;
            }

            await bot.bot.sendMessage(
                chatId,
                `👋 ${user.first_name || 'Пользователь'}, опишите вашу проблему или вопрос, ` +
                `и я передам его куратору. Ожидайте ответа в этом чате.`,
                {
                    protect_content: true
                }
            );

            userStates.awaitingHelpMessage.add(chatId);

        } catch (error) {
            console.error('Error in help command:', error);
            await bot.bot.sendMessage(chatId, '⚠️ Произошла ошибка при обработке команды',
                {
                    protect_content: true
                }
            );
        }
    });
}