import { Model } from 'sequelize';

export class BaseModel extends Model {
    static init(sequelize) {
        if (!this.attributes) {
            throw new Error(`Model ${this.name} must have static attributes property`);
        }

        super.init(this.attributes, {
            sequelize,
            modelName: this.name.replace('Model', ''),
            tableName: this.tableName || this.name.toLowerCase().replace('model', 's'),
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
        });

        return this;
    }
}