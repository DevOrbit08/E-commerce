import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    vehicle: { type: String, default: '', trim: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const DeliveryPartner = mongoose.models.deliveryPartner || mongoose.model('deliveryPartner', deliveryPartnerSchema);

export default DeliveryPartner;
