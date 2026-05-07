import { database } from '../database/database.mjs';
import { UserModel } from './user.mjs';
import { PaymentModel } from './payment.mjs';

export const models = {};

export async function initializeModels() {
    models.User = UserModel.init(database.sequelize);
    models.Payment = PaymentModel.init(database.sequelize);

    // Define associations
    models.Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    return models;
}