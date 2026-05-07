export class CallbackHandler {
    constructor(bot) {
        this.bot = bot;
        this.callbacks = new Map();
        
        this.bot.on('callback_query', (callbackQuery) => {
            const data = callbackQuery.data;
            const [action, ...params] = data.split('|');
            
            if (this.callbacks.has(action)) {
                try {
                    const handler = this.callbacks.get(action);
                    handler(callbackQuery, params);
                } catch (error) {
                    console.error(`Error handling callback ${action}:`, error);
                    this.bot.answerCallbackQuery(callbackQuery.id, {
                        text: '⚠️ Произошла ошибка',
                        show_alert: true
                    });
                }
            } else {
                this.bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Действие истекло',
                    show_alert: false
                });
            }
        });
    }

    register(action, handler) {
        this.callbacks.set(action, handler);
    }

    generateButton(action, ...params) {
        return {
            text: 'Button',
            callback_data: [action, ...params].join('|')
        };
    }
}