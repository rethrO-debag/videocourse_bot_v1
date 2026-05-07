import 'dotenv/config';
import { database } from './config/database/database.mjs';
import { initializeModels, models } from './config/models/initializeModels.mjs';
import { bot } from './bot/bot.mjs';
import { setupHandlers } from './bot/handlers/setupHandlers.mjs';
import { setDefaultCommands } from './bot/utils/setDefaultCommands.mjs';
import { UserService } from './bot/services/user.service.mjs';
import { PaymentService } from './bot/services/payment.service.mjs';


class App {
    static async initialize() {
        try {
            // Подключение к базе данных с повторами
            await this.connectWithRetry();
            
            const userService = new UserService(models.User, database.sequelize);
            const paymentService = new PaymentService(models.Payment, database.sequelize);
            
            // Инициализация бота
            if (bot.mode === 'webhook') {
                await bot.setupWebhook();
            } else {
                bot.startPolling();
            }
            
            await setDefaultCommands();
            // Настройка обработчиков
            const tg_bot = bot.getBotInstance()
            await setupHandlers( { tg_bot, userService, paymentService } );
            
            console.log('🤖 Бот успешно запущен');
            this.setupProcessHandlers();
        } catch (error) {
            console.error('💥 Ошибка при запуске приложения:', error);
            process.exit(1);
        }
    }

    static async connectWithRetry(maxRetries = 5, delay = 5000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await database.connect();
                await initializeModels();
                await database.syncModels();
                return;
            } catch (err) {
                console.error(`Попытка подключения ${i + 1}/${maxRetries} не удалась`);
                if (i === maxRetries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    static setupProcessHandlers() {
        const gracefulShutdown = async () => {
            console.log('\n🛑 Завершение работы...');
            try {
                await bot.stop();
                await database.disconnect();
                console.log('👋 Ресурсы освобождены');
                process.exit(0);
            } catch (err) {
                console.error('❌ Ошибка при завершении работы:', err);
                process.exit(1);
            }
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        process.on('unhandledRejection', (reason, promise) => {
            console.error('⚠️ Необработанный rejection:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('⚠️ Необработанное исключение:', error);
            // Можно добавить логику перезапуска
        });
    }
}

// Запуск приложения
if (process.env.RUN_STANDALONE === 'true') {
    App.initialize();
}

export default App;