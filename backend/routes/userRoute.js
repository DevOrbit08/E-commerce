import express from 'express';
import { register, login, isAuth, logout, updateProfile, getCustomers } from '../controllers/userController.js';
import authSeller from '../middlewares/authSeller.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/is-auth', authUser, isAuth);
userRouter.post('/profile', authUser, updateProfile);
userRouter.get('/customers', authSeller, getCustomers);
userRouter.get('/logout', logout);


export default userRouter;