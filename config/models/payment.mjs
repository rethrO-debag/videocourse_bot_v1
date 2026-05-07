import { DataTypes } from 'sequelize';
import { BaseModel } from './baseModel.mjs';

export class PaymentModel extends BaseModel {
    static attributes = {
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'RUB'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'bank_transfer'
        },
        receipt_file_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_type: {
            type: DataTypes.ENUM('photo', 'document'),
            allowNull: false
        },
        course_name: {
            type: DataTypes.STRING,
            defaultValue: 'Основной курс'
        },
        course_type: {
            type: DataTypes.ENUM('basic', 'with_mentor'),
            defaultValue: 'basic'
        }
    };
}