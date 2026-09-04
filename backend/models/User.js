import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, unique: true, sparse: true},
    phone: {type: String, unique: true, sparse: true},
    password: {type: String, required: true},
    cartItems: {type: Object, default: {}}
}, {minimize: false});

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;