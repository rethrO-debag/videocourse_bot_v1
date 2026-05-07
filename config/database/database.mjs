import { Sequelize } from 'sequelize';

export class Database {
    constructor() {
        this.sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                dialect: 'postgres',
                logging: process.env.NODE_ENV === 'development' ? console.log : false,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                retry: {
                    max: 5,
                    match: [
                        /ETIMEDOUT/,
                        /EHOSTUNREACH/,
                        /ECONNRESET/,
                        /ECONNREFUSED/,
                        /ETIMEDOUT/,
                        /ESOCKETTIMEDOUT/,
                        /EHOSTUNREACH/,
                        /EPIPE/,
                        /EAI_AGAIN/,
                        /SequelizeConnectionError/,
                        /SequelizeConnectionRefusedError/,
                        /SequelizeHostNotFoundError/,
                        /SequelizeHostNotReachableError/,
                        /SequelizeInvalidConnectionError/,
                        /SequelizeConnectionTimedOutError/
                    ],
                    backoffBase: 1000,
                    backoffExponent: 1.5
                }
            }
        );
    }

    async connect() {
        try {
            await this.sequelize.authenticate();
            console.log('✅ Подключение к базе данных установлено');
            return true;
        } catch (error) {
            console.error('❌ Ошибка подключения к базе данных:', error.message);
            throw error;
        }
    }

    async syncModels(options = { alter: true }) {
        try {
            await this.sequelize.sync(options);
            console.log('🔄 Модели базы данных синхронизированы');
        } catch (error) {
            console.error('❌ Ошибка синхронизации моделей:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.sequelize.close();
            console.log('📴 Подключение к базе данных закрыто');
        } catch (error) {
            console.error('❌ Ошибка при закрытии подключения:', error.message);
        }
    }
}

export const database = new Database();