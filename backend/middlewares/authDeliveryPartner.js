import jwt from 'jsonwebtoken';
import DeliveryPartner from '../models/DeliveryPartner.js';

const authDeliveryPartner = async (req, res, next) => {
    const { deliveryPartnerToken } = req.cookies;
    if (!deliveryPartnerToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const decoded = jwt.verify(deliveryPartnerToken, process.env.JWT_SECRET);
        const partner = await DeliveryPartner.findById(decoded.deliveryPartnerId).select('_id');
        if (!partner) {
            return res.json({ success: false, message: 'Delivery partner account was removed' });
        }
        req.deliveryPartnerId = partner._id.toString();
        next();
    } catch (error) {
        return res.json({ success: false, message: 'Not Authorized' });
    }
};

export default authDeliveryPartner;
