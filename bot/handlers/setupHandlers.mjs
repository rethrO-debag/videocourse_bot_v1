import { bot } from '../bot.mjs';
import { CallbackHandler } from '../services/callback_constructor.mjs';
import { CommandHandler } from '../services/command_constructor.mjs';
import { MessageHandler } from '../services/message_constructor.mjs';
import { feedbackRequests } from '../services/feedbackState.mjs';

// Импорт с исправлением - добавлены requestCuratorHelp и sendReplyToUser
import { 
    setupStartCommand,
    handlePaymentReceipt,
    setupHelpCommand,
    requestCuratorHelp,
    sendReplyToUser,
    handleReplyToHelp,
    userStates,
    curatorStates
} from './command/index.mjs';

// Импорт обработчиков
import { handleApprovePayment } from './callback/approvePaymentHandler.mjs';
import { handleRejectPayment } from './callback/rejectPaymentHandler.mjs';
import { handleSetCourseType } from './callback/setCourseTypeHandler.mjs';
import { handleGetVideoLesson } from './callback/getVideoLessonHandler.mjs';
import { handleSubmitHomework } from './callback/submitHomeworkHandler.mjs';
import { handleAcceptHomework } from './callback/acceptHomeworkHandler.mjs';
import { handleRejectHomework } from './callback/rejectHomeworkHandler.mjs';
import { handleRequestFeedback, handleFeedbackMessage } from './callback/feedbackHandler.mjs';
import { handleHomeworkVideo } from './message/homeworkHandler.mjs';


export const callbackHandler = new CallbackHandler(bot.bot);
export const commandHandler = new CommandHandler(bot.bot);
export const messageHandler = new MessageHandler(bot.bot);

export async function setupHandlers({ bot, userService, paymentService }) {
    // Настройка команд
    await setupStartCommand(commandHandler, userService);
    await setupHelpCommand({ commandHandler }, userService);

    // Обработчик платежных чеков
    messageHandler.addHandler(
        msg => msg.document || msg.photo,
        msg => handlePaymentReceipt(msg, userService, paymentService)
    );
    
    // Обработчик домашних заданий
    messageHandler.addHandler(
        msg => msg.video !== undefined,
        async (msg) => {
            if (msg.video) {
                await handleHomeworkVideo(msg, userService);
            }
        }
    );
    
    // Обработчик обратной связи
    messageHandler.addHandler(
        msg => msg.text && feedbackRequests.has(msg.from.id),
        msg => handleFeedbackMessage(msg, userService)
    );
    
    // Обработчик help-сообщений
    messageHandler.addHandler(
        msg => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            
            if (userStates.awaitingHelpMessage.has(chatId)) return true;
            if (curatorStates.activeSessions.has(userId)) return true;
            
            return false;
        },
        async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            
            try {
                // Обработка сообщения пользователя после команды /help
                if (userStates.awaitingHelpMessage.has(chatId)) {
                    if (msg.text && !msg.text.startsWith('/')) {
                        userStates.awaitingHelpMessage.delete(chatId);
                        const { user } = await userService.createOrUpdate(msg.from);
                        await requestCuratorHelp(chatId, user, msg.text);
                    } else {
                        userStates.awaitingHelpMessage.delete(chatId);
                        await bot.bot.sendMessage(
                            chatId,
                            '❌ Ожидалось текстовое сообщение. Пожалуйста, опишите вашу проблему текстом.', 
                            {
                                protect_content: true
                            }
                        );
                    }
                }

                // Обработка ответа куратора
                if (curatorStates.activeSessions.has(userId)) {
                    const requestData = curatorStates.activeSessions.get(userId);
                    if (msg.text) {
                        await sendReplyToUser(msg, requestData, userService);
                        curatorStates.activeSessions.delete(userId);
                    } else {
                        await bot.bot.sendMessage(
                            msg.chat.id,
                            '❌ Пожалуйста, отправьте текстовый ответ для пользователя.',
                            {
                                protect_content: true
                            }
                        );
                    }
                }
            } catch (error) {
                console.error('Error handling help messages:', error);
            }
        }
    );

    // Регистрация callback-обработчиков
    callbackHandler.register('reply_to_help', handleReplyToHelp);
    callbackHandler.register('approve_payment', (cb, args) => 
        handleApprovePayment(cb, args, paymentService, userService)
    );
    callbackHandler.register('reject_payment', (cb, args) => 
        handleRejectPayment(cb, args, paymentService, userService)
    );
    callbackHandler.register('set_course_type', (cb, args) => 
        handleSetCourseType(cb, args, paymentService, userService)
    );
    callbackHandler.register('get_video_lesson', (cb) => 
        handleGetVideoLesson(cb, userService)
    );
    callbackHandler.register('submit_homework', (cb) => 
        handleSubmitHomework(cb, userService)
    );
    callbackHandler.register('accept_homework', (cb, args) => 
        handleAcceptHomework(cb, args, userService)
    );
    callbackHandler.register('reject_homework', (cb, args) => 
        handleRejectHomework(cb, args, userService)
    );
    callbackHandler.register('request_feedback', (cb, args) => 
        handleRequestFeedback(cb, args, userService)
    );

    console.log('✅ Все обработчики запущены');
}