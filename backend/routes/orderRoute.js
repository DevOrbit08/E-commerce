import express from 'express';
import authUser from '../middlewares/authUser.js';
import { cancelOrder, getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, updateOrderStatus } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.post('/cancel', authUser, cancelOrder);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.put('/seller/:orderId/status', authSeller, updateOrderStatus);
orderRouter.post('/stripe', authUser, placeOrderStripe);

export default orderRouter;