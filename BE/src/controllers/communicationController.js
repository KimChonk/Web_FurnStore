const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get customer contact info for order
// @route   GET /api/communication/order/:orderId/contact
// @access  Private/Delivery
const getCustomerContactInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone profile.alternatePhone profile.preferredContactMethod')
      .populate('deliveryPerson', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this contact info
    const isDeliveryPerson = req.user.role === 'delivery' && 
                              order.deliveryPerson && 
                              order.deliveryPerson._id.toString() === req.user._id.toString();
    const isAuthorized = req.user.role === 'admin' || 
                        req.user.role === 'warehouse' || 
                        req.user.role === 'support' ||
                        isDeliveryPerson;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prepare contact information
    const contactInfo = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        alternatePhone: order.customer.profile?.alternatePhone || null,
        preferredContactMethod: order.customer.profile?.preferredContactMethod || 'phone'
      },
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone
      },
      orderStatus: order.status,
      deliveryAttempts: order.deliveryAttempts?.length || 0,
      lastAttempt: order.deliveryAttempts?.length > 0 
        ? order.deliveryAttempts[order.deliveryAttempts.length - 1]
        : null,
      estimatedDelivery: order.estimatedDelivery,
      specialInstructions: order.notes
    };

    // Add communication history if available
    if (order.communicationHistory) {
      contactInfo.communicationHistory = order.communicationHistory
        .slice(-5) // Last 5 communications
        .map(comm => ({
          type: comm.type,
          message: comm.message,
          timestamp: comm.timestamp,
          initiatedBy: comm.initiatedBy
        }));
    }

    res.status(200).json({
      success: true,
      data: contactInfo
    });

  } catch (error) {
    console.error('Get customer contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact information'
    });
  }
};

// @desc    Get delivery address with navigation info
// @route   GET /api/communication/order/:orderId/address
// @access  Private/Delivery
const getDeliveryAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { includeNavigation = false } = req.query;

    const order = await Order.findById(orderId)
      .populate('customer', 'name phone')
      .populate('deliveryPerson', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isDeliveryPerson = req.user.role === 'delivery' && 
                              order.deliveryPerson && 
                              order.deliveryPerson._id.toString() === req.user._id.toString();
    const isAuthorized = req.user.role === 'admin' || 
                        req.user.role === 'warehouse' ||
                        isDeliveryPerson;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const addressInfo = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      deliveryAddress: {
        fullName: order.shippingAddress.fullName,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone
      },
      customerContact: {
        name: order.customer.name,
        phone: order.customer.phone
      },
      orderValue: order.totalPrice,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
      deliveryInstructions: order.notes
    };

    // Add navigation links if requested
    if (includeNavigation === 'true') {
      const fullAddress = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`;
      const encodedAddress = encodeURIComponent(fullAddress);
      
      addressInfo.navigation = {
        googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        googleMapsDirection: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
        appleMaps: `http://maps.apple.com/?q=${encodedAddress}`,
        waze: `https://waze.com/ul?q=${encodedAddress}`,
        formattedAddress: fullAddress
      };
    }

    // Add previous delivery attempts for context
    if (order.deliveryAttempts && order.deliveryAttempts.length > 0) {
      addressInfo.previousAttempts = order.deliveryAttempts.map(attempt => ({
        date: attempt.attemptDate,
        status: attempt.status,
        notes: attempt.notes,
        failureReason: attempt.failureReason
      }));
    }

    res.status(200).json({
      success: true,
      data: addressInfo
    });

  } catch (error) {
    console.error('Get delivery address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery address'
    });
  }
};

// @desc    Log communication with customer
// @route   POST /api/communication/order/:orderId/log
// @access  Private/Delivery/Support
const logCommunication = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { 
      type, 
      method, 
      message, 
      duration, 
      outcome, 
      followUpRequired = false,
      followUpDate 
    } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create communication log entry
    const communicationEntry = {
      type, // 'call', 'sms', 'email', 'chat'
      method, // 'outgoing', 'incoming'
      message,
      duration: type === 'call' ? duration : null,
      outcome, // 'connected', 'no_answer', 'busy', 'delivered', 'failed'
      timestamp: new Date(),
      initiatedBy: req.user._id,
      followUpRequired,
      followUpDate: followUpRequired && followUpDate ? new Date(followUpDate) : null
    };

    // Add to order's communication history
    if (!order.communicationHistory) {
      order.communicationHistory = [];
    }
    order.communicationHistory.push(communicationEntry);

    // Update order notes with communication summary
    const commSummary = `[${new Date().toLocaleString()}] ${type.toUpperCase()} - ${outcome} - ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`;
    order.notes = order.notes ? `${order.notes}\n${commSummary}` : commSummary;

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Communication logged successfully',
      data: {
        communicationId: communicationEntry._id,
        logged: communicationEntry
      }
    });

  } catch (error) {
    console.error('Log communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging communication'
    });
  }
};

// @desc    Initiate call to customer
// @route   POST /api/communication/order/:orderId/call
// @access  Private/Delivery/Support
const initiateCall = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { phoneType = 'primary', reason } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer', 'name phone profile.alternatePhone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Determine which phone number to call
    let phoneNumber;
    if (phoneType === 'primary') {
      phoneNumber = order.customer.phone || order.shippingAddress.phone;
    } else if (phoneType === 'alternate') {
      phoneNumber = order.customer.profile?.alternatePhone;
    } else if (phoneType === 'shipping') {
      phoneNumber = order.shippingAddress.phone;
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: `No ${phoneType} phone number available for this customer`
      });
    }

    // Log the call initiation
    const callLog = {
      type: 'call',
      method: 'outgoing',
      message: `Call initiated - Reason: ${reason || 'Delivery coordination'}`,
      outcome: 'initiated',
      timestamp: new Date(),
      initiatedBy: req.user._id,
      phoneNumber: phoneNumber,
      phoneType: phoneType
    };

    if (!order.communicationHistory) {
      order.communicationHistory = [];
    }
    order.communicationHistory.push(callLog);
    await order.save();

    // Return call information (in a real system, this would integrate with telephony API)
    res.status(200).json({
      success: true,
      message: 'Call initiated',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        phoneNumber: phoneNumber,
        phoneType: phoneType,
        callId: callLog._id,
        // In production, you might return a telephony session ID here
        instructions: {
          manual: `Please call ${phoneNumber} to contact ${order.customer.name}`,
          autoDialUrl: `tel:${phoneNumber}` // This will trigger auto-dial on mobile devices
        }
      }
    });

  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initiating call'
    });
  }
};

// @desc    Send SMS to customer
// @route   POST /api/communication/order/:orderId/sms
// @access  Private/Delivery/Support
const sendSMS = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message, phoneType = 'primary', template } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer', 'name phone profile.alternatePhone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Determine which phone number to send SMS to
    let phoneNumber;
    if (phoneType === 'primary') {
      phoneNumber = order.customer.phone || order.shippingAddress.phone;
    } else if (phoneType === 'alternate') {
      phoneNumber = order.customer.profile?.alternatePhone;
    } else if (phoneType === 'shipping') {
      phoneNumber = order.shippingAddress.phone;
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: `No ${phoneType} phone number available for this customer`
      });
    }

    // Prepare SMS message
    let smsMessage = message;
    if (template) {
      // Use predefined templates
      const templates = {
        'on_the_way': `Xin chào ${order.customer.name}, đơn hàng ${order.orderNumber} đang được giao đến địa chỉ của bạn. Dự kiến: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleString() : 'trong ngày'}. Cảm ơn!`,
        'arrival_soon': `Xin chào ${order.customer.name}, chúng tôi sẽ đến giao đơn hàng ${order.orderNumber} trong 15-30 phút tới. Vui lòng chuẩn bị sẵn sàng nhận hàng. Cảm ơn!`,
        'failed_delivery': `Xin chào ${order.customer.name}, chúng tôi không thể giao đơn hàng ${order.orderNumber} hôm nay. Vui lòng liên hệ ${req.user.phone || 'hotline'} để sắp xếp lại thời gian giao hàng.`,
        'delivery_complete': `Xin chào ${order.customer.name}, đơn hàng ${order.orderNumber} đã được giao thành công. Cảm ơn bạn đã mua hàng!`,
        'contact_request': `Xin chào ${order.customer.name}, chúng tôi cần liên hệ với bạn về đơn hàng ${order.orderNumber}. Vui lòng gọi lại ${req.user.phone || 'hotline'} khi thuận tiện.`
      };
      
      smsMessage = templates[template] || message;
    }

    // Log the SMS
    const smsLog = {
      type: 'sms',
      method: 'outgoing',
      message: smsMessage,
      outcome: 'sent', // In production, this would be updated based on SMS gateway response
      timestamp: new Date(),
      initiatedBy: req.user._id,
      phoneNumber: phoneNumber,
      phoneType: phoneType,
      template: template || null
    };

    if (!order.communicationHistory) {
      order.communicationHistory = [];
    }
    order.communicationHistory.push(smsLog);
    await order.save();

    // In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
    // const smsResult = await smsGateway.send(phoneNumber, smsMessage);

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        phoneNumber: phoneNumber,
        message: smsMessage,
        smsId: smsLog._id,
        // In production, include SMS gateway response
        status: 'sent'
      }
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending SMS'
    });
  }
};

// @desc    Get communication history for order
// @route   GET /api/communication/order/:orderId/history
// @access  Private
const getCommunicationHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { limit = 20, type } = req.query;

    const order = await Order.findById(orderId)
      .populate('communicationHistory.initiatedBy', 'name role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    let history = order.communicationHistory || [];

    // Filter by communication type if specified
    if (type) {
      history = history.filter(comm => comm.type === type);
    }

    // Sort by most recent first and limit results
    history = history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    // Calculate communication statistics
    const stats = {
      totalCommunications: order.communicationHistory?.length || 0,
      callCount: order.communicationHistory?.filter(c => c.type === 'call').length || 0,
      smsCount: order.communicationHistory?.filter(c => c.type === 'sms').length || 0,
      emailCount: order.communicationHistory?.filter(c => c.type === 'email').length || 0,
      lastCommunication: order.communicationHistory?.length > 0 
        ? order.communicationHistory[order.communicationHistory.length - 1].timestamp
        : null
    };

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        history,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get communication history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching communication history'
    });
  }
};

// @desc    Get SMS templates
// @route   GET /api/communication/sms-templates
// @access  Private/Delivery/Support
const getSMSTemplates = async (req, res) => {
  try {
    const templates = {
      'on_the_way': {
        name: 'Đang trên đường giao hàng',
        description: 'Thông báo đang giao hàng đến khách',
        variables: ['customerName', 'orderNumber', 'estimatedTime']
      },
      'arrival_soon': {
        name: 'Sắp đến nơi giao hàng',
        description: 'Thông báo sẽ đến trong 15-30 phút',
        variables: ['customerName', 'orderNumber']
      },
      'failed_delivery': {
        name: 'Giao hàng thất bại',
        description: 'Thông báo không thể giao hàng',
        variables: ['customerName', 'orderNumber', 'contactPhone']
      },
      'delivery_complete': {
        name: 'Giao hàng thành công',
        description: 'Xác nhận đã giao hàng thành công',
        variables: ['customerName', 'orderNumber']
      },
      'contact_request': {
        name: 'Yêu cầu liên hệ',
        description: 'Yêu cầu khách hàng gọi lại',
        variables: ['customerName', 'orderNumber', 'contactPhone']
      },
      'address_verification': {
        name: 'Xác minh địa chỉ',
        description: 'Yêu cầu xác minh lại địa chỉ giao hàng',
        variables: ['customerName', 'orderNumber', 'currentAddress']
      },
      'schedule_delivery': {
        name: 'Hẹn lịch giao hàng',
        description: 'Hẹn lại thời gian giao hàng',
        variables: ['customerName', 'orderNumber', 'proposedTime']
      }
    };

    res.status(200).json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get SMS templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching SMS templates'
    });
  }
};

module.exports = {
  getCustomerContactInfo,
  getDeliveryAddress,
  logCommunication,
  initiateCall,
  sendSMS,
  getCommunicationHistory,
  getSMSTemplates
};
