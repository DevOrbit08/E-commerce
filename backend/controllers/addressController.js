import Address from '../models/Address.js';
import User from '../models/User.js';

// Add Address : /api/address/add
export const addAddress = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { address } = req.body;
        if (!address || !userId) {
            return res.json({ success: false, message: 'Missing address or user' });
        }
        const fullName = (address.fullName || `${address.firstName || ''} ${address.lastName || ''}`).trim();
        const nameParts = fullName.split(/\s+/);
        const user = await User.findById(userId).select('email');

        if (!fullName || !address.phone || !address.city || !address.state || !(address.zip || address.zipcode)) {
            return res.json({ success: false, message: 'Please complete all required address fields' });
        }

        // Normalize the form fields to the address schema.
        const addrPayload = {
            userId,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            email: address.email || user?.email || '',
            street: [address.houseFlat, address.street].filter(Boolean).join(', '),
            city: address.city,
            state: address.state,
            zipcode: Number(address.zip || address.zipcode || 0),
            country: address.country || 'India',
            phone: address.phone,
        };
        const created = await Address.create(addrPayload);
        res.json({success: true, message: "Address added successfully", address: created});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get Address : /api/address/get
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const addresses = await Address.find({userId});
        res.json({success: true, addresses});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}