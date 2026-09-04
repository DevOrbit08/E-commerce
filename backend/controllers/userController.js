import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

// Register User : /api/user/register
export const register = async (req, res) => {
    try {
        const { name, identifier, password } = req.body;
        if(!name || !identifier || !password){
            return res.json({success: false, message: 'Missing Details'});
        }
        const isEmail = identifier.includes('@');
        const contact = isEmail ? { email: identifier.trim().toLowerCase() } : { phone: identifier.trim() };
        const existingUser = await User.findOne(contact);
        if(existingUser)
            return res.json({success: false, message: "User Already Exists"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name: name.trim(), ...contact, password: hashedPassword});
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('userToken', token, {
            httpOnly: true,  // Prevent JavaScript to access cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF Production
            maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
            path: '/'
        })
        return res.json({success: true, user: {email: user.email, phone: user.phone, name: user.name}});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Login User : /api/user/login

export const login = async (req, res) => {
    try {
        const {identifier, password} = req.body;
        if(!identifier || !password){
            return res.json({success: false, message: "Email/Phone and Password are required"});
        }
        const normalizedIdentifier = identifier.trim();
        const query = normalizedIdentifier.includes('@')
            ? { email: normalizedIdentifier.toLowerCase() }
            : { phone: normalizedIdentifier };
        const user = await User.findOne(query);
        if(!user){
            return res.json({success: false, message: "Invalid Email or Password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
            return res.json({success: false, message: "Invalid Email or Password"});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('userToken', token, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/' 
        });
        return res.json({success: true, user: {email: user.email, phone: user.phone, name: user.name}});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});       
    }

}

export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        if (!name || (!email && !phone)) {
            return res.json({ success: false, message: 'Name and email or phone are required' });
        }
        const update = { name: name.trim() };
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedPhone = phone?.trim();
        if (normalizedEmail || normalizedPhone) {
            const duplicate = await User.findOne({
                _id: { $ne: req.userId },
                $or: [
                    ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
                    ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
                ],
            }).select('_id email phone');
            if (duplicate) {
                return res.json({
                    success: false,
                    message: duplicate.email === normalizedEmail
                        ? 'This email is already linked to another account'
                        : 'This phone number is already linked to another account',
                });
            }
        }
        if (normalizedEmail) update.email = normalizedEmail;
        if (normalizedPhone) update.phone = normalizedPhone;
        const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true }).select('-password');
        return res.json({ success: true, user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({success: true, user});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message}); 
    }
}

export const getCustomers = async (req, res) => {
    try {
        const customers = await User.find().select('-password').sort({ createdAt: -1 });
        return res.json({ success: true, customers });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Check User Logout : /api/user/logout
export  const logout = async (req, res) => {
    try {
        res.clearCookie('userToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/' 
        });
        return res.json({success: true, message: 'Logged Out!'});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}
