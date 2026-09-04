import express from 'express';
import { addDeliveryPartner, getDeliveryPartners } from '../controllers/deliveryPartnerController.js';
import authSeller from '../middlewares/authSeller.js';

const deliveryPartnerRouter = express.Router();

deliveryPartnerRouter.get('/list', authSeller, getDeliveryPartners);
deliveryPartnerRouter.post('/add', authSeller, addDeliveryPartner);

export default deliveryPartnerRouter;
