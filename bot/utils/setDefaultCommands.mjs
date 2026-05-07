import { bot } from '../bot.mjs';

export async function setDefaultCommands() {
    const commands = [
        { command: '/start', description: 'Начать работать с ботом' },
        { command: '/help', description: 'Получить помощь от куратора' }
    ];

    try {
        await bot.bot.setMyCommands(commands);
        console.log('✅ Набор команд по умолчанию');
    } catch (error) {
        console.error('❌ Не удалось установить команды по умолчанию:', error);
        throw error;
    }
}