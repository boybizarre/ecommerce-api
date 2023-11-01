const express = require('express');

const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/get-total-sales').get(orderController.getTotalSales);
router.route('/user-orders/:userId').get(orderController.getUserOrder);

router
  .route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

// router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrderStatus)
  .delete(orderController.deleteOrder);

module.exports = router;
