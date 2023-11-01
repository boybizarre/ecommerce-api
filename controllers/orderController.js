const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOrder = catchAsync(async (req, res, next) => {
  // looping through the orderitems array of object sent on req body to create order items before creating the orderItem with it
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = await OrderItem.create({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      // return the newly created OrderItem ids
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;
  // console.log(orderItemsIdsResolved); // mongoose object id

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  // console.log(totalPrices); // [96, 50]

  const order = await Order.create({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice,
    user: req.body.user,
  });

  res.status(201).json({
    status: 'success',
    data: order,
  });

  /* 
  
  {
    "orderItems": [
        {
            "quantity": 3,
            "product": "65367f58d4e488a96f76120c"
        },
        {
            "quantity": 2,
            "product": "653882f905c033a63de92839"
        }
    ],
    "shippingAddress1": "Edinburgh street, 45",
    "shippingAddress2": "French street, 37",
    "city": "Paris",
    "zip": "010100",
    "country": "France",
    "phone": "+4207957245564793",
    "user": "653a7cbaa579104dffe84acb"
  }*/
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orderList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1 });

  if (!orderList) return next(new AppError(`No orders found`, 404));

  res.status(200).json({
    status: 'success',
    results: orderList.length,
    requestedAt: req.requestTime,
    data: orderList,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  // .populate('user', 'name')
  // .populate({ path: 'orderItems', populate: 'product' })
  // .sort({ dateOrdered: -1 });

  if (!order) {
    return next(new AppError(`No order found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError(`Invalid order ID`, 404));
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true, //returns the updated data in response
      runValidators: true,
    }
  );

  if (!order) {
    return next(new AppError(`No order found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  console.log(order);

  if (!order) {
    return next(new AppError(`No order found with that ID`, 404));
  } else {
    order.orderItems.map(async (orderItem) => {
      await OrderItem.findByIdAndDelete(orderItem);
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTotalSales = catchAsync(async (req, res, next) => {
  const totalSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);

  if (!totalSales) {
    return next(new AppError(`The order sales cannot be generated`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: totalSales.pop().totalSales,
  });
});

exports.getUserOrder = catchAsync(async (req, res, next) => {
  const userOrderList = await Order.find({ user: req.params.userId });

  if (!userOrderList) {
    return next(new AppError(`No orders found`, 404));
  }

  res.status(200).json({
    status: 'success',
    results: userOrderList.length,
    data: userOrderList,
  });
});
