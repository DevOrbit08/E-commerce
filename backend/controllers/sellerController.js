import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Seller from '../models/Seller.js';

const sellerResponse = (seller) => ({
    name: seller.name,
    email: seller.email,
    phone: seller.phone || '',
});

// Seller Login : /api/seller/login
export const sellerLogin = async (req, res) => {
    try{
        const { identifier, email, password } = req.body;
        const loginIdentifier = (identifier || email || '').trim();
        if(!loginIdentifier || !password){
            return res.json({success: false, message: 'Email/Phone and Password are required'});
        }

        const query = loginIdentifier.includes('@')
            ? { email: loginIdentifier.toLowerCase() }
            : { phone: loginIdentifier };
        let seller = await Seller.findOne(query);

        if(!seller && loginIdentifier.toLowerCase() === process.env.SELLER_EMAIL?.toLowerCase() && password === process.env.SELLER_PASSWORD){
            seller = await Seller.create({
                name: 'Admin',
                email: process.env.SELLER_EMAIL.toLowerCase(),
                password: await bcrypt.hash(process.env.SELLER_PASSWORD, 10),
            });
        }

        if(!seller || !(await bcrypt.compare(password, seller.password))){
            return res.json({success: false, message: 'Invalid Credentials!'});
        }

        if(seller){
            const token = jwt.sign({sellerId: seller._id.toString()}, process.env.JWT_SECRET, {expiresIn: '7d'});
            res.cookie('sellerToken', token, {
                httpOnly: true,  
                secure: process.env.NODE_ENV === 'production', 
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
                maxAge: 7 * 24 * 60 * 60 * 1000, 
            });
            return res.json({success: true, message: "Logged In!", seller: sellerResponse(seller)});
        }
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Check Seller Auth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try {
        const seller = await Seller.findById(req.sellerId).select('-password');
        if(!seller) return res.json({success: false, message: 'Seller not found'});
        return res.json({success: true, seller: sellerResponse(seller)});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message}); 
    }
};

export const getSellerProfile = async (req, res) => {
        try {
            const seller = await Seller.findById(req.sellerId).select('-password');
            if(!seller) return res.json({success: false, message: 'Seller not found'});
            return res.json({success: true, seller: sellerResponse(seller)});
        } catch (error) {
            return res.json({success: false, message: error.message});
        }
};

export const updateSellerProfile = async (req, res) => {
        try {
            const { name, email, phone, newPassword, confirmPassword } = req.body;
            if(!name?.trim() || !email?.trim()) {
                return res.json({success: false, message: 'Full name and email are required'});
            }
            if(newPassword || confirmPassword) {
                if(newPassword !== confirmPassword) {
                    return res.json({success: false, message: 'Passwords do not match'});
                }
                if(newPassword.length < 6) {
                    return res.json({success: false, message: 'New password must be at least 6 characters'});
                }
            }

            const normalizedEmail = email.trim().toLowerCase();
            const normalizedPhone = phone?.trim() || undefined;
            const duplicate = await Seller.findOne({
                _id: { $ne: req.sellerId },
                $or: [
                    { email: normalizedEmail },
                    ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
                ],
            });
            if(duplicate) return res.json({success: false, message: 'Email or phone is already in use'});

            const update = { name: name.trim(), email: normalizedEmail, phone: normalizedPhone };
            if(newPassword) update.password = await bcrypt.hash(newPassword, 10);
            const seller = await Seller.findByIdAndUpdate(req.sellerId, update, {new: true, runValidators: true}).select('-password');
            return res.json({success: true, seller: sellerResponse(seller)});
        } catch (error) {
            return res.json({success: false, message: error.message});
        }
};

// Check Seller Logout : /api/seller/logout
export  const sellerLogout = async (req, res) => {
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        return res.json({success: true, message: 'Admin Logged Out!'});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}
