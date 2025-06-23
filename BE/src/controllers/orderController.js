const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice = 0,
      shippingPrice = 0,
      notes
    } = req.body;

    // Validate order items exist and are available
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Verify products exist and get current prices
    const productIds = orderItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== orderItems.length) {
      return res.status(400).json({
        success: false,
        message: 'Some products were not found'
      });
    }

    // Validate stock availability and update order items with current data
    const updatedOrderItems = [];
    for (const item of orderItems) {
      const product = products.find(p => p._id.toString() === item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      updatedOrderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price, // Use current price
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : null
      });
    }

    // Calculate total price
    const itemsPrice = updatedOrderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Create order
    const order = await Order.create({
      customer: req.user._id,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
      notes
    });

    // Update product stock
    for (const item of updatedOrderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('orderItems.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Get all orders (Admin/Warehouse)
// @route   GET /api/orders
// @access  Private/Admin/Warehouse
const getOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      startDate,
      endDate,
      isPaid,
      isDelivered
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by payment status
    if (isPaid !== undefined) {
      query.isPaid = isPaid === 'true';
    }

    // Filter by delivery status
    if (isDelivered !== undefined) {
      query.isDelivered = isDelivered === 'true';
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search by customer name or order number
    if (search) {
      // This would require a more complex aggregation for order number search
      // For now, we'll search by customer name
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      if (users.length > 0) {
        query.customer = { $in: users.map(u => u._id) };
      }
    }

    // Pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'customer', select: 'name email phone' },
        { path: 'deliveryPerson', select: 'name email phone' },
        { path: 'orderItems.product', select: 'name price images' }
      ]
    };

    const orders = await Order.paginate(query, options);

    res.status(200).json({
      success: true,
      data: orders.docs,
      pagination: {
        currentPage: orders.page,
        totalPages: orders.totalPages,
        totalOrders: orders.totalDocs,
        hasNext: orders.hasNextPage,
        hasPrev: orders.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('orderItems.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user can access this order
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add order number to response
    const orderData = order.toObject();
    orderData.orderNumber = order.orderNumber;

    res.status(200).json({
      success: true,
      data: orderData
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { customer: req.user._id };
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'orderItems.product', select: 'name price images' }
      ]
    };

    const orders = await Order.paginate(query, options);

    // Add order numbers
    const ordersWithNumbers = orders.docs.map(order => {
      const orderData = order.toObject();
      orderData.orderNumber = order.orderNumber;
      return orderData;
    });

    res.status(200).json({
      success: true,
      data: ordersWithNumbers,
      pagination: {
        currentPage: orders.page,
        totalPages: orders.totalPages,
        totalOrders: orders.totalDocs,
        hasNext: orders.hasNextPage,
        hasPrev: orders.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Warehouse
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.status} to ${status}`
      });
    }

    // Update order status
    await order.updateStatus(status);

    // Add notes if provided
    if (notes) {
      order.notes = order.notes ? `${order.notes}\n${notes}` : notes;
      await order.save();
    }

    // If cancelled, restore product stock
    if (status === 'cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email')
      .populate('deliveryPerson', 'name email');

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Assign delivery person to order
// @route   PUT /api/orders/:id/assign-delivery
// @access  Private/Admin
const assignDeliveryPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    const orderId = req.params.id;

    // Validate delivery person exists and has correct role
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.role !== 'delivery') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery person'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.assignDeliveryPerson(deliveryPersonId);

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email')
      .populate('deliveryPerson', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Delivery person assigned successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Assign delivery person error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning delivery person'
    });
  }
};

// @desc    Mark order as paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const markOrderAsPaid = async (req, res) => {
  try {
    const { paymentResult } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    await order.markAsPaid(paymentResult);

    res.status(200).json({
      success: true,
      message: 'Order marked as paid',
      data: order
    });

  } catch (error) {
    console.error('Mark order as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking order as paid'
    });
  }
};

// @desc    Get orders for warehouse (pending/confirmed orders)
// @route   GET /api/orders/warehouse
// @access  Private/Warehouse
const getWarehouseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      status: { $in: ['confirmed', 'processing'] },
      isDelivered: false
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: 'createdAt', // Oldest first for warehouse preparation
      populate: [
        { path: 'customer', select: 'name phone' },
        { path: 'orderItems.product', select: 'name sku images category' }
      ]
    };

    const orders = await Order.paginate(query, options);

    // Add order numbers and format for warehouse view
    const warehouseOrders = orders.docs.map(order => {
      const orderData = order.toObject();
      orderData.orderNumber = order.orderNumber;
      
      // Group items by category for easier picking
      const itemsByCategory = {};
      orderData.orderItems.forEach(item => {
        const category = item.product.category || 'Uncategorized';
        if (!itemsByCategory[category]) {
          itemsByCategory[category] = [];
        }
        itemsByCategory[category].push(item);
      });
      
      orderData.itemsByCategory = itemsByCategory;
      return orderData;
    });

    res.status(200).json({
      success: true,
      data: warehouseOrders,
      pagination: {
        currentPage: orders.page,
        totalPages: orders.totalPages,
        totalOrders: orders.totalDocs,
        hasNext: orders.hasNextPage,
        hasPrev: orders.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get warehouse orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching warehouse orders'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get general order statistics
    const orderStats = await Order.getOrderStats();

    // Get revenue by month for current year
    const revenueStats = await Order.getRevenueByMonth();

    // Get recent orders count by status
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    const recentStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          productName: { $first: '$orderItems.name' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: orderStats,
        revenue: revenueStats,
        recent: recentStats,
        topProducts
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

// @desc    Update order tracking information
// @route   PUT /api/orders/:id/tracking
// @access  Private/Warehouse
const updateOrderTracking = async (req, res) => {
  try {
    const { tracking } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update tracking information
    order.tracking = {
      ...order.tracking,
      ...tracking
    };

    // If tracking number is provided and order is confirmed, mark as shipped
    if (tracking.trackingNumber && order.status === 'processing') {
      order.status = 'shipped';
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email')
      .populate('deliveryPerson', 'name email');

    res.status(200).json({
      success: true,
      message: 'Tracking information updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tracking information'
    });
  }
};

// @desc    Generate order slip for printing
// @route   GET /api/orders/:id/slip
// @access  Private/Warehouse
const generateOrderSlip = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name sku images category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate slip data
    const slipData = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email
      },
      shippingAddress: order.shippingAddress,
      items: order.orderItems.map(item => ({
        name: item.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        category: item.product.category
      })),
      summary: {
        subtotal: order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        taxPrice: order.taxPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice
      },
      paymentMethod: order.paymentMethod,
      status: order.status,
      notes: order.notes,
      generatedAt: new Date(),
      generatedBy: req.user.name || req.user.email
    };

    res.status(200).json({
      success: true,
      data: slipData
    });

  } catch (error) {
    console.error('Generate order slip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating order slip'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  getMyOrders,
  updateOrderStatus,
  assignDeliveryPerson,
  markOrderAsPaid,
  getWarehouseOrders,
  getOrderStats,
  updateOrderTracking,
  generateOrderSlip
};
