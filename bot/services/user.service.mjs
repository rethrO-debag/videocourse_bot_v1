import { BaseService } from './base.service.mjs';

export class UserService extends BaseService {
    constructor(userModel, sequelize) {
        super(userModel, sequelize);
    }

    async createOrUpdate(telegramUser) {
        if (!telegramUser || !telegramUser.id) {
            throw new Error('Неверные данные пользователя Telegram');
        }
        
        const userData = {
            telegram_id: telegramUser.id,
            username: telegramUser.username || '',
            first_name: telegramUser.first_name || 'User',
            last_name: telegramUser.last_name || '',
            is_admin: false
        };

        const [user, created] = await this.model.findOrCreate({
            where: { telegram_id: telegramUser.id },
            defaults: userData
        });

        if (!created) {
            const updateData = {};
            if (telegramUser.first_name && telegramUser.first_name !== user.first_name) {
                updateData.first_name = telegramUser.first_name;
            }
            if (telegramUser.last_name && telegramUser.last_name !== user.last_name) {
                updateData.last_name = telegramUser.last_name;
            }
            if (telegramUser.username && telegramUser.username !== user.username) {
                updateData.username = telegramUser.username;
            }
            
            if (Object.keys(updateData).length > 0) {
                await this.model.update(updateData, {
                    where: { telegram_id: telegramUser.id }
                });
                Object.assign(user, updateData);
            }
        }

        return { user, created };
    }
    
    async findByTelegramId(telegramId, options = {}) {
        if (!telegramId) throw new Error('Требуется идентификатор telegram Id');
        return this.findOne({ telegram_id: telegramId }, options);
    }
}