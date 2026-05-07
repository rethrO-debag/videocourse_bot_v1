import TelegramBot from 'node-telegram-bot-api';

export class TelegramBotApp {
    constructor() {
        this.mode = process.env.BOT_MODE || 'polling';
        this.isRunning = false;
        
        if (!process.env.TELEGRAM_TOKEN) {
            throw new Error('TELEGRAM_TOKEN не найден');
        }

        this.token = process.env.TELEGRAM_TOKEN.trim();
        this.bot = new TelegramBot(this.token, {
            polling: false, // Инициализируем без автоматического старта
            request: {
                timeout: 60000
            }
        });

        this.setupErrorHandlers();
    }

    setupErrorHandlers() {
        this.bot.on('polling_error', (error) => {
            console.error('🚨 Polling ошибка:', error.message);
            this.isRunning = false;
        });

        this.bot.on('webhook_error', (error) => {
            console.error('🚨 Webhook ошибка:', error.message);
            this.isRunning = false;
        });
    }

    async setupWebhook() {
        if (!process.env.WEBHOOK_URL) {
            throw new Error('WEBHOOK_URL требуется для работы в режиме webhook');
        }
        
        const webhookUrl = `${process.env.WEBHOOK_URL}/bot${this.token}`;
        await this.bot.setWebHook(webhookUrl, {
            drop_pending_updates: true
        });
        this.isRunning = true;
        console.log(`🌍 Webhook сконфигурирован: ${webhookUrl}`);
    }

    startPolling() {
        if (!this.bot.isPolling()) {
            this.bot.startPolling({
                drop_pending_updates: true,
                timeout: 10
            });
            this.isRunning = true;
            console.log('📡 Polling запущен');
        }
    }

    stop() {
        if (this.mode === 'polling') {
            this.bot.stopPolling();
            console.log('🛑 Polling остановлен');
        } else {
            this.bot.deleteWebHook();
            console.log('🛑 Webhook удален');
        }
        this.isRunning = false;
    }

    getBotInstance() {
        return this.bot;
    }
}


export const bot = new TelegramBotApp();