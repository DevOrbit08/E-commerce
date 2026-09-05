import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true },
}, { timestamps: true });

const Seller = mongoose.models.seller || mongoose.model('seller', sellerSchema);

export default Seller;
