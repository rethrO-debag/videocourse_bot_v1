// utils/helpers.mjs

/**
 * Форматирует сумму в денежный формат RUB
 * @param {number} amount - Сумма
 * @returns {string} Отформатированная строка
 */
export function formatPrice(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Получает пользователя из БД или создает нового
 * @param {number} telegramId - ID пользователя в Telegram
 * @param {Object} userService - Сервис пользователей
 * @returns {Promise<User>} Объект пользователя
 */
export async function getOrCreateUser(telegramId, userService) {
    return userService.findOrCreate(
        { telegram_id: telegramId },
        {
            username: `user_${telegramId}`,
            first_name: `User ${telegramId}`,
            last_name: '',
            is_admin: false,
            status: 'active'
        }
    );
}