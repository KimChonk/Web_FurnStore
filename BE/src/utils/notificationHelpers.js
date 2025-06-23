// Utility functions for sending notifications
// This is a placeholder implementation - in production, you would integrate with:
// - Email service (SendGrid, AWS SES, etc.)
// - Push notification service (Firebase, OneSignal, etc.)
// - SMS service (Twilio, AWS SNS, etc.)
// - WebSocket for real-time notifications

const User = require('../models/User');

/**
 * Send notification to a user
 * @param {string} userId - The ID of the user to notify
 * @param {object} notification - Notification object
 * @param {string} notification.type - Type of notification
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {object} notification.data - Additional data
 */
const sendNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`User ${userId} not found for notification`);
      return;
    }

    // Log notification for development
    console.log(`[NOTIFICATION] To: ${user.email}`);
    console.log(`[NOTIFICATION] Type: ${notification.type}`);
    console.log(`[NOTIFICATION] Title: ${notification.title}`);
    console.log(`[NOTIFICATION] Message: ${notification.message}`);
    console.log(`[NOTIFICATION] Data:`, notification.data);

    // In production, implement actual notification sending:
    
    // 1. Email notification
    // await sendEmailNotification(user.email, notification);
    
    // 2. Push notification (if user has device tokens)
    // await sendPushNotification(user.deviceTokens, notification);
    
    // 3. In-app notification (store in database)
    // await createInAppNotification(userId, notification);
    
    // 4. WebSocket notification (if user is online)
    // await sendWebSocketNotification(userId, notification);

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

/**
 * Send email notification (placeholder)
 */
const sendEmailNotification = async (email, notification) => {
  // Implement email sending logic here
  // Example using a service like SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: notification.title,
    text: notification.message,
    html: generateEmailTemplate(notification)
  };
  
  await sgMail.send(msg);
  */
  console.log(`[EMAIL] Would send to ${email}: ${notification.title}`);
};

/**
 * Send push notification (placeholder)
 */
const sendPushNotification = async (deviceTokens, notification) => {
  // Implement push notification logic here
  // Example using Firebase Admin SDK:
  /*
  const admin = require('firebase-admin');
  
  const message = {
    notification: {
      title: notification.title,
      body: notification.message
    },
    data: notification.data,
    tokens: deviceTokens
  };
  
  await admin.messaging().sendMulticast(message);
  */
  console.log(`[PUSH] Would send to ${deviceTokens?.length || 0} devices: ${notification.title}`);
};

/**
 * Create in-app notification (placeholder)
 */
const createInAppNotification = async (userId, notification) => {
  // Store notification in database for in-app display
  // You might create a Notification model for this
  /*
  const Notification = require('../models/Notification');
  
  await Notification.create({
    userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: false,
    createdAt: new Date()
  });
  */
  console.log(`[IN-APP] Would create notification for user ${userId}: ${notification.title}`);
};

/**
 * Send WebSocket notification (placeholder)
 */
const sendWebSocketNotification = async (userId, notification) => {
  // Send real-time notification via WebSocket
  // This would integrate with your WebSocket server
  /*
  const io = require('socket.io-client');
  const socket = io(process.env.WEBSOCKET_SERVER);
  
  socket.emit('notification', {
    userId,
    notification
  });
  */
  console.log(`[WEBSOCKET] Would send to user ${userId}: ${notification.title}`);
};

/**
 * Send bulk notifications to multiple users
 */
const sendBulkNotification = async (userIds, notification) => {
  const results = await Promise.allSettled(
    userIds.map(userId => sendNotification(userId, notification))
  );
  
  const successful = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.filter(result => result.status === 'rejected').length;
  
  console.log(`[BULK] Sent ${successful} notifications, ${failed} failed`);
  
  return { successful, failed, total: userIds.length };
};

/**
 * Send notification to users by role
 */
const sendNotificationByRole = async (roles, notification) => {
  try {
    const users = await User.find({ 
      role: { $in: Array.isArray(roles) ? roles : [roles] },
      isActive: true 
    }).select('_id');
    
    const userIds = users.map(user => user._id.toString());
    return await sendBulkNotification(userIds, notification);
  } catch (error) {
    console.error('Error sending notification by role:', error);
    return { successful: 0, failed: 0, total: 0 };
  }
};

/**
 * Send notification to store staff
 */
const sendNotificationToStoreStaff = async (storeId, notification) => {
  try {
    const Store = require('../models/Store');
    const store = await Store.findById(storeId).populate('staff', '_id');
    
    if (!store || !store.staff || store.staff.length === 0) {
      console.warn(`No staff found for store ${storeId}`);
      return { successful: 0, failed: 0, total: 0 };
    }
    
    const userIds = store.staff.map(staff => staff._id.toString());
    return await sendBulkNotification(userIds, notification);
  } catch (error) {
    console.error('Error sending notification to store staff:', error);
    return { successful: 0, failed: 0, total: 0 };
  }
};

/**
 * Generate notification templates for different types
 */
const getNotificationTemplate = (type, data) => {
  const templates = {
    ticket_assigned: {
      title: 'New Support Ticket Assigned',
      message: `You have been assigned ticket #${data.ticketNumber}: ${data.subject}`,
      emailTemplate: 'ticket-assigned'
    },
    ticket_escalated: {
      title: 'Support Ticket Escalated',
      message: `Ticket #${data.ticketNumber} has been escalated to you. Priority: ${data.priority}`,
      emailTemplate: 'ticket-escalated'
    },
    ticket_response: {
      title: 'New Response on Support Ticket',
      message: `New response on ticket #${data.ticketNumber}`,
      emailTemplate: 'ticket-response'
    },
    order_status_update: {
      title: 'Order Status Update',
      message: `Your order #${data.orderNumber} status has been updated to: ${data.status}`,
      emailTemplate: 'order-status'
    },
    promotion_new: {
      title: 'New Promotion Available',
      message: `Check out our new promotion: ${data.title}`,
      emailTemplate: 'promotion-new'
    },
    inventory_low_stock: {
      title: 'Low Stock Alert',
      message: `Product "${data.productName}" is running low on stock (${data.quantity} remaining)`,
      emailTemplate: 'inventory-alert'
    }
  };
  
  return templates[type] || {
    title: 'Notification',
    message: 'You have a new notification',
    emailTemplate: 'default'
  };
};

module.exports = {
  sendNotification,
  sendBulkNotification,
  sendNotificationByRole,
  sendNotificationToStoreStaff,
  getNotificationTemplate
};
