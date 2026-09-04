import DeliveryPartner from '../models/DeliveryPartner.js';

export const getDeliveryPartners = async (req, res) => {
    try {
        const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
        return res.json({ success: true, partners });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const addDeliveryPartner = async (req, res) => {
    try {
        const { name, phone, email, vehicle } = req.body;
        if (!name?.trim() || !phone?.trim()) {
            return res.json({ success: false, message: 'Name and phone number are required' });
        }
        const partner = await DeliveryPartner.create({ name, phone, email, vehicle });
        return res.json({ success: true, partner });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
