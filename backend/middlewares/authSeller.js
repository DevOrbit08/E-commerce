import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';


const authSeller = async (req, res, next) => {
    const {sellerToken} = req.cookies;

    if(!sellerToken){
        return res.json({success: false, message: "Not Authorized"});
    }
    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if(tokenDecode.sellerId){
            req.sellerId = tokenDecode.sellerId;
            next();
        }else if(tokenDecode.email){
            const seller = await Seller.findOne({ email: tokenDecode.email.toLowerCase() }).select('_id');
            if(!seller){
                return res.json({success: false, message: "Not Authorized"});
            }
            req.sellerId = seller._id.toString();
            next();
        }else{
            return res.json({success: false, message: "Not Authorized"});
        }
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export default authSeller;