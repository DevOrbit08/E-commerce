import DeliveryPartner from '../models/DeliveryPartner.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getDeliveryPartners = async (req, res) => {
    try {
        const partners = await DeliveryPartner.find().select('-password').sort({ createdAt: -1 });
        return res.json({ success: true, partners });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const addDeliveryPartner = async (req, res) => {
    try {
        const { name, phone, email, vehicle, password } = req.body;
        if (!name?.trim() || !phone?.trim() || !email?.trim() || !password) {
            return res.json({ success: false, message: 'Name, phone, email, and password are required' });
        }
        if (password.length < 6) {
            return res.json({ success: false, message: 'Password must be at least 6 characters' });
        }
        const existing = await DeliveryPartner.findOne({ email: email.trim().toLowerCase() });
        if (existing) return res.json({ success: false, message: 'A delivery partner with this email already exists' });
        const partner = await DeliveryPartner.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            vehicle: vehicle?.trim() || '',
            password: await bcrypt.hash(password, 10),
        });
        const safePartner = partner.toObject();
        delete safePartner.password;
        return res.json({ success: true, partner: safePartner });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const removeDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Delivery partner ID is required' });
        }
        const partner = await DeliveryPartner.findByIdAndDelete(id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Delivery partner not found' });
        }
        return res.json({ success: true, message: 'Delivery partner removed' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Unable to remove delivery partner' });
    }
};

export const updateDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, vehicle, newPassword, confirmPassword } = req.body;
        if (!name?.trim() || !phone?.trim() || !email?.trim()) {
            return res.json({ success: false, message: 'Name, phone, and email are required' });
        }
        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                return res.json({ success: false, message: 'Passwords do not match' });
            }
            if (newPassword.length < 6) {
                return res.json({ success: false, message: 'Password must be at least 6 characters' });
            }
        }
        const normalizedEmail = email.trim().toLowerCase();
        const duplicate = await DeliveryPartner.findOne({ email: normalizedEmail, _id: { $ne: id } });
        if (duplicate) return res.json({ success: false, message: 'A delivery partner with this email already exists' });

        const update = {
            name: name.trim(),
            phone: phone.trim(),
            email: normalizedEmail,
            vehicle: vehicle?.trim() || '',
        };
        if (newPassword) update.password = await bcrypt.hash(newPassword, 10);
        const partner = await DeliveryPartner.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select('-password');
        if (!partner) return res.status(404).json({ success: false, message: 'Delivery partner not found' });
        return res.json({ success: true, partner });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deliveryPartnerLogin = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginIdentifier = (identifier || email || '').trim();
        if (!loginIdentifier || !password) {
            return res.json({ success: false, message: 'Email/Phone and password are required' });
        }
        const query = loginIdentifier.includes('@')
            ? { email: loginIdentifier.toLowerCase() }
            : { phone: loginIdentifier };
        const partner = await DeliveryPartner.findOne(query);
        if (!partner || !(await bcrypt.compare(password || '', partner.password))) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ deliveryPartnerId: partner._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('deliveryPartnerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
            success: true,
            partner: {
                name: partner.name,
                email: partner.email,
                phone: partner.phone,
                vehicle: partner.vehicle,
            },
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const deliveryPartnerAuth = async (req, res) => {
    const partner = await DeliveryPartner.findById(req.deliveryPartnerId).select('-password');
    if (!partner) return res.json({ success: false, message: 'Delivery partner account was removed' });
    return res.json({ success: true, partner });
};
