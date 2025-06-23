const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get delivery assignments for logged-in delivery person
// @route   GET /api/delivery/assignments
// @access  Private/Delivery
const getMyDeliveryAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query for delivery person's assigned orders
    const query = {
      deliveryPerson: req.user._id,
      status: { $in: ['shipped', 'delivered'] }
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { 
          path: 'customer', 
          select: 'name email phone' 
        },
        { 
          path: 'orderItems.product', 
          select: 'name images weight dimensions' 
        }
      ]
    };

    const orders = await Order.paginate(query, options);

    // Add order numbers and format for delivery view
    const deliveryOrders = orders.docs.map(order => {
      const orderData = order.toObject();
      orderData.orderNumber = order.orderNumber;
      
      // Calculate total weight and volume for delivery planning
      let totalWeight = 0;
      let totalVolume = 0;
      
      orderData.orderItems.forEach(item => {
        if (item.product.weight) {
          totalWeight += item.product.weight * item.quantity;
        }
        if (item.product.dimensions) {
          const volume = item.product.dimensions.length * item.product.dimensions.width * item.product.dimensions.height;
          totalVolume += volume * item.quantity;
        }
      });
      
      orderData.deliveryInfo = {
        totalWeight,
        totalVolume,
        itemCount: orderData.orderItems.length
      };
      
      return orderData;
    });

    res.status(200).json({
      success: true,
      data: deliveryOrders,
      pagination: {
        currentPage: orders.page,
        totalPages: orders.totalPages,
        totalOrders: orders.totalDocs,
        hasNext: orders.hasNextPage,
        hasPrev: orders.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get delivery assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery assignments'
    });
  }
};

// @desc    Get all orders available for delivery assignment (Admin)
// @route   GET /api/delivery/available
// @access  Private/Admin
const getAvailableForDelivery = async (req, res) => {
  try {
    const { page = 1, limit = 20, city, urgency } = req.query;

    // Orders that are shipped but don't have delivery person assigned
    const query = {
      status: 'shipped',
      deliveryPerson: { $exists: false }
    };

    // Filter by city if provided
    if (city) {
      query['shippingAddress.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by urgency (orders older than 24 hours)
    if (urgency === 'urgent') {
      const urgentDate = new Date();
      urgentDate.setHours(urgentDate.getHours() - 24);
      query.createdAt = { $lte: urgentDate };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: 'createdAt', // Oldest first for urgent delivery
      populate: [
        { path: 'customer', select: 'name phone' },
        { path: 'orderItems.product', select: 'name weight dimensions' }
      ]
    };

    const orders = await Order.paginate(query, options);

    // Group orders by city for better assignment planning
    const ordersByCity = {};
    orders.docs.forEach(order => {
      const city = order.shippingAddress.city;
      if (!ordersByCity[city]) {
        ordersByCity[city] = [];
      }
      
      const orderData = order.toObject();
      orderData.orderNumber = order.orderNumber;
      orderData.isUrgent = new Date() - order.createdAt > 24 * 60 * 60 * 1000;
      
      ordersByCity[city].push(orderData);
    });

    res.status(200).json({
      success: true,
      data: {
        orders: orders.docs,
        ordersByCity,
        pagination: {
          currentPage: orders.page,
          totalPages: orders.totalPages,
          totalOrders: orders.totalDocs,
          hasNext: orders.hasNextPage,
          hasPrev: orders.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get available for delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available orders'
    });
  }
};

// @desc    Update delivery status with details
// @route   PUT /api/delivery/:orderId/status
// @access  Private/Delivery
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes, deliveryAttempts, failureReason, estimatedRetry } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the delivery person is assigned to this order
    if (order.deliveryPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this order'
      });
    }

    // Update order status
    order.status = status;
    
    // If delivered successfully
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    // Add delivery notes
    const deliveryNote = `[${new Date().toLocaleString()}] ${req.user.name}: ${notes || 'Status updated to ' + status}`;
    order.notes = order.notes ? `${order.notes}\n${deliveryNote}` : deliveryNote;

    // Add delivery attempt tracking
    if (!order.deliveryAttempts) {
      order.deliveryAttempts = [];
    }

    order.deliveryAttempts.push({
      attemptDate: new Date(),
      status,
      notes,
      deliveryPerson: req.user._id,
      failureReason: status === 'delivery_failed' ? failureReason : undefined,
      estimatedRetry: status === 'delivery_failed' && estimatedRetry ? new Date(estimatedRetry) : undefined
    });

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('deliveryPerson', 'name phone');

    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating delivery status'
    });
  }
};

// @desc    Confirm successful delivery
// @route   POST /api/delivery/:orderId/confirm
// @access  Private/Delivery
const confirmDeliverySuccess = async (req, res) => {
  try {
    const { 
      receiverName, 
      receiverPhone, 
      deliveryNotes, 
      signatureRequired = false,
      proofPhotos = []
    } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the delivery person is assigned to this order
    if (order.deliveryPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this order'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order is already marked as delivered'
      });
    }

    // Mark as delivered
    order.status = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = new Date();

    // Add delivery confirmation details
    order.deliveryConfirmation = {
      confirmedAt: new Date(),
      confirmedBy: req.user._id,
      receiverName,
      receiverPhone,
      deliveryNotes,
      signatureRequired,
      proofPhotos
    };

    // Add confirmation note
    const confirmationNote = `[${new Date().toLocaleString()}] DELIVERED - Confirmed by ${req.user.name}. Received by: ${receiverName}${receiverPhone ? ` (${receiverPhone})` : ''}. ${deliveryNotes || ''}`;
    order.notes = order.notes ? `${order.notes}\n${confirmationNote}` : confirmationNote;

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('deliveryPerson', 'name phone');

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Confirm delivery success error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming delivery'
    });
  }
};

// @desc    Report delivery failure
// @route   POST /api/delivery/:orderId/failure
// @access  Private/Delivery
const reportDeliveryFailure = async (req, res) => {
  try {
    const {
      failureReason,
      failureDetails,
      customerNotAvailable,
      incorrectAddress,
      refusedDelivery,
      estimatedRetry,
      requiresAction
    } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the delivery person is assigned to this order
    if (order.deliveryPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this order'
      });
    }

    // Create delivery failure report
    const failureReport = {
      reportedAt: new Date(),
      reportedBy: req.user._id,
      failureReason,
      failureDetails,
      customerNotAvailable,
      incorrectAddress,
      refusedDelivery,
      estimatedRetry: estimatedRetry ? new Date(estimatedRetry) : null,
      requiresAction
    };

    // Add to order's delivery failures array
    if (!order.deliveryFailures) {
      order.deliveryFailures = [];
    }
    order.deliveryFailures.push(failureReport);

    // Update order status based on failure type
    if (refusedDelivery) {
      order.status = 'delivery_refused';
    } else if (incorrectAddress) {
      order.status = 'address_verification_needed';
    } else {
      order.status = 'delivery_failed';
    }

    // Add failure note
    const failureNote = `[${new Date().toLocaleString()}] DELIVERY FAILED - ${failureReason}. Details: ${failureDetails}. Reported by: ${req.user.name}${estimatedRetry ? `. Retry scheduled: ${new Date(estimatedRetry).toLocaleString()}` : ''}`;
    order.notes = order.notes ? `${order.notes}\n${failureNote}` : failureNote;

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('deliveryPerson', 'name phone');

    res.status(200).json({
      success: true,
      message: 'Delivery failure reported successfully',
      data: updatedOrder,
      requiresAction
    });

  } catch (error) {
    console.error('Report delivery failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting delivery failure'
    });
  }
};

// @desc    Get delivery history for delivery person
// @route   GET /api/delivery/history
// @access  Private/Delivery
const getDeliveryHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      status,
      includeFailures = false 
    } = req.query;

    // Build query
    const query = {
      deliveryPerson: req.user._id
    };

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // Default to completed deliveries unless includeFailures is true
      query.status = includeFailures === 'true' 
        ? { $in: ['delivered', 'delivery_failed', 'delivery_refused', 'cancelled'] }
        : 'delivered';
    }

    // Date range filter
    if (startDate || endDate) {
      query.deliveredAt = {};
      if (startDate) {
        query.deliveredAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.deliveredAt.$lte = new Date(endDate);
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-deliveredAt',
      populate: [
        { path: 'customer', select: 'name phone' }
      ]
    };

    const orders = await Order.paginate(query, options);

    // Calculate delivery statistics
    const stats = await Order.aggregate([
      {
        $match: {
          deliveryPerson: req.user._id,
          deliveredAt: { $exists: true }
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

    // Add order numbers to results
    const historyOrders = orders.docs.map(order => {
      const orderData = order.toObject();
      orderData.orderNumber = order.orderNumber;
      return orderData;
    });

    res.status(200).json({
      success: true,
      data: {
        orders: historyOrders,
        statistics: stats,
        pagination: {
          currentPage: orders.page,
          totalPages: orders.totalPages,
          totalOrders: orders.totalDocs,
          hasNext: orders.hasNextPage,
          hasPrev: orders.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get delivery history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery history'
    });
  }
};

// @desc    Report emergency incident
// @route   POST /api/delivery/incident
// @access  Private/Delivery
const reportEmergencyIncident = async (req, res) => {
  try {
    const {
      incidentType,
      description,
      location,
      severity,
      requiresImmediateResponse,
      affectedOrderIds = [],
      contactNumber
    } = req.body;

    // Create incident report
    const incidentReport = {
      reportedBy: req.user._id,
      reportedAt: new Date(),
      incidentType,
      description,
      location,
      severity,
      requiresImmediateResponse,
      affectedOrderIds,
      contactNumber: contactNumber || req.user.phone,
      status: 'reported'
    };

    // For now, we'll store this in the user's emergency reports
    // In a real system, this would go to a dedicated incidents collection
    const user = await User.findById(req.user._id);
    if (!user.emergencyReports) {
      user.emergencyReports = [];
    }
    user.emergencyReports.push(incidentReport);
    await user.save();

    // If orders are affected, update their status
    if (affectedOrderIds.length > 0) {
      await Order.updateMany(
        { _id: { $in: affectedOrderIds } },
        { 
          $set: { status: 'emergency_hold' },
          $push: { 
            notes: `[${new Date().toLocaleString()}] EMERGENCY INCIDENT - ${incidentType}: ${description}. Reported by: ${req.user.name}`
          }
        }
      );
    }

    // In a real system, this would trigger notifications to management
    // and emergency response procedures

    res.status(201).json({
      success: true,
      message: 'Emergency incident reported successfully',
      data: {
        incidentId: incidentReport._id,
        reportedAt: incidentReport.reportedAt,
        severity,
        requiresImmediateResponse,
        affectedOrders: affectedOrderIds.length
      }
    });

  } catch (error) {
    console.error('Report emergency incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting emergency incident'
    });
  }
};

// @desc    Upload delivery proof photos
// @route   POST /api/delivery/:orderId/photos
// @access  Private/Delivery
const uploadDeliveryPhotos = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { photoType = 'delivery_proof', description } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the delivery person is assigned to this order
    if (order.deliveryPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this order'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    // Process uploaded photos
    const photoRecords = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: req.user._id,
      photoType,
      description
    }));

    // Add photos to order's delivery photos array
    if (!order.deliveryPhotos) {
      order.deliveryPhotos = [];
    }
    order.deliveryPhotos.push(...photoRecords);

    // Add note about photo upload
    const photoNote = `[${new Date().toLocaleString()}] ${req.files.length} delivery photo(s) uploaded by ${req.user.name}${description ? ` - ${description}` : ''}`;
    order.notes = order.notes ? `${order.notes}\n${photoNote}` : photoNote;

    await order.save();

    res.status(200).json({
      success: true,
      message: `${req.files.length} photo(s) uploaded successfully`,
      data: {
        orderId,
        photosUploaded: req.files.length,
        photos: photoRecords
      }
    });

  } catch (error) {
    console.error('Upload delivery photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading delivery photos'
    });
  }
};

// @desc    Bulk assign orders to delivery person (Admin)
// @route   POST /api/delivery/bulk-assign
// @access  Private/Admin
const bulkAssignDelivery = async (req, res) => {
  try {
    const { orderIds, deliveryPersonId } = req.body;

    // Validate delivery person
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.role !== 'delivery') {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery person'
      });
    }

    // Validate orders exist and are available for assignment
    const orders = await Order.find({
      _id: { $in: orderIds },
      status: 'shipped',
      deliveryPerson: { $exists: false }
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some orders are not available for delivery assignment'
      });
    }

    // Assign delivery person to all orders
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        deliveryPerson: deliveryPersonId,
        $push: {
          notes: `[${new Date().toLocaleString()}] Assigned to delivery person: ${deliveryPerson.name} by ${req.user.name}`
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `${orders.length} orders assigned to ${deliveryPerson.name}`,
      data: {
        assignedOrders: orders.length,
        deliveryPerson: {
          id: deliveryPerson._id,
          name: deliveryPerson.name,
          phone: deliveryPerson.phone
        }
      }
    });

  } catch (error) {
    console.error('Bulk assign delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning orders'
    });
  }
};

module.exports = {
  getMyDeliveryAssignments,
  getAvailableForDelivery,
  updateDeliveryStatus,
  confirmDeliverySuccess,
  reportDeliveryFailure,
  getDeliveryHistory,
  reportEmergencyIncident,
  uploadDeliveryPhotos,
  bulkAssignDelivery
};
