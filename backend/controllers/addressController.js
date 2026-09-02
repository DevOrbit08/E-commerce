import Address from '../models/Address.js';

// Add Address : /api/address/add
export const addAddress = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { address } = req.body;
        if (!address || !userId) {
            return res.json({ success: false, message: 'Missing address or user' });
        }
        // Normalize fields: client uses zip, model expects zipcode
        const addrPayload = {
            userId,
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            street: address.street,
            city: address.city,
            state: address.state,
            zipcode: Number(address.zip || address.zipcode || 0),
            country: address.country,
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