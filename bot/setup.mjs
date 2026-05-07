import { setupCommandHandlers } from './command.mjs';
import { setupMessageHandlers } from './message.mjs';
import { setupCallbackHandlers } from './callback.mjs';
import { bot } from '../bot.mjs';

export async function setupHandlers() {
    // Инициализация всех обработчиков
    setupCommandHandlers(bot.bot);
    setupMessageHandlers(bot.bot);
    setupCallbackHandlers(bot.bot);
    
    console.log('✅ All handlers initialized');
}