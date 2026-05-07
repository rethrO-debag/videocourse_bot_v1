export class BaseService {
    constructor(model, sequelize) {
        if (!model) throw new Error('Модель, не предоставленная базовому сервису');
        this.model = model;
        this.sequelize = sequelize;
    }

    async create(data, transaction = null) {
        const options = transaction ? { transaction } : {};
        return this.model.create(data, options);
    }

    async findOne(where, options = {}) {
        return this.model.findOne({
            where,
            ...options
        });
    }

    async findAll(where = {}, options = {}) {
        if (Object.keys(where).length === 0 && !options.limit) {
            throw new Error('Небезопасный запрос: добавление условий или ограничение');
        }
        
        return this.model.findAll({
            where,
            ...options
        });
    }

    async update(where, data, options = {}) {
        if (Object.keys(where).length === 0) {
            throw new Error("Update without WHERE clause is forbidden");
        }
        
        const [affectedCount] = await this.model.update(data, {
            where,
            ...options
        });
        
        return affectedCount > 0;
    }

    async delete(where, transaction = null) {
        if (Object.keys(where).length === 0) {
            throw new Error("Удалять без указания WHERE запрещено");
        }
        
        const options = {
            where,
            ...(transaction && { transaction })
        };
        
        const affectedCount = await this.model.destroy(options);
        return affectedCount > 0;
    }

    async findOrCreate(where, defaults, transaction = null) {
        const options = {
            where,
            defaults,
            ...(transaction && { transaction })
        };
        return this.model.findOrCreate(options);
    }

    async transaction(callback) {
        return this.sequelize.transaction(callback);
    }
}