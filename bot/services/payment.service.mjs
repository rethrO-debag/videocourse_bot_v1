import { BaseService } from './base.service.mjs';

export class PaymentService extends BaseService {
    constructor(paymentModel, sequelize) {
        super(paymentModel, sequelize);
    }

    async createPending(userId, courseId, amount, fileId, fileType) {
        return this.create({
            user_id: userId,
            course_id: courseId,
            amount,
            receipt_file_id: fileId,
            file_type: fileType,
            status: 'pending',
            payment_method: 'bank_transfer'
        });
    }

    async update(where, data) {
        return super.update(where, data);
    }
}