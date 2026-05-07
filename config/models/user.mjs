import { DataTypes } from 'sequelize';
import { BaseModel } from './baseModel.mjs';

export class UserModel extends BaseModel {
    static attributes = {
        telegram_id: {
            type: DataTypes.BIGINT,
            unique: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        has_access: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        access_granted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        with_mentor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        active_payment_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        current_lesson: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        last_video_request: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_lesson: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    };
}