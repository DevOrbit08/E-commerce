import express from 'express';
import { addDeliveryPartner, deliveryPartnerAuth, deliveryPartnerLogin, getDeliveryPartners, removeDeliveryPartner, updateDeliveryPartner } from '../controllers/deliveryPartnerController.js';
import authSeller from '../middlewares/authSeller.js';
import authDeliveryPartner from '../middlewares/authDeliveryPartner.js';

const deliveryPartnerRouter = express.Router();

deliveryPartnerRouter.post('/login', deliveryPartnerLogin);
deliveryPartnerRouter.get('/is-auth', authDeliveryPartner, deliveryPartnerAuth);
deliveryPartnerRouter.get('/list', authSeller, getDeliveryPartners);
deliveryPartnerRouter.post('/add', authSeller, addDeliveryPartner);
deliveryPartnerRouter.post('/remove/:id', authSeller, removeDeliveryPartner);
deliveryPartnerRouter.put('/:id', authSeller, updateDeliveryPartner);
deliveryPartnerRouter.delete('/:id', authSeller, removeDeliveryPartner);

export default deliveryPartnerRouter;
