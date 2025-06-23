const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Order = require('../models/Order');
const { sendNotification } = require('../utils/notificationHelpers');

// Create a new support ticket
const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      orderId,
      contactMethod,
      customerInfo
    } = req.body;

    const ticketData = {
      subject,
      description,
      category,
      priority: priority || 'medium',
      contactMethod: contactMethod || 'email',
      createdBy: req.user.id
    };

    // Add customer info if user is not authenticated (guest)
    if (customerInfo && !req.user) {
      ticketData.customerInfo = customerInfo;
    }

    // Add order reference if provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      ticketData.relatedOrder = orderId;
    }

    // Auto-assign based on category and current workload
    const assignedAgent = await autoAssignAgent(category);
    if (assignedAgent) {
      ticketData.assignedTo = assignedAgent._id;
      ticketData.status = 'assigned';
    }

    const ticket = new SupportTicket(ticketData);
    await ticket.save();

    // Populate for response
    await ticket.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'relatedOrder', select: 'orderNumber totalAmount status' }
    ]);

    // Send notification to assigned agent
    if (assignedAgent) {
      await sendNotification(assignedAgent._id, {
        type: 'ticket_assigned',
        title: 'New Support Ticket Assigned',
        message: `You have been assigned ticket #${ticket.ticketNumber}: ${subject}`,
        data: { ticketId: ticket._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
};

// Get all tickets with filtering and pagination
const getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Apply filters based on user role
    if (req.user.role === 'staff') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'customer') {
      filter.createdBy = req.user.id;
    }

    // Additional filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo && req.user.role !== 'customer') filter.assignedTo = assignedTo;

    // Search functionality
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'assignedTo', select: 'firstName lastName email department' },
        { path: 'relatedOrder', select: 'orderNumber totalAmount status' }
      ]
    };

    const tickets = await SupportTicket.paginate(filter, options);

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
      error: error.message
    });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email department')
      .populate('relatedOrder', 'orderNumber totalAmount status createdAt')
      .populate('escalations.escalatedTo', 'firstName lastName email department')
      .populate('escalations.escalatedBy', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && ticket.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own tickets.'
      });
    }

    if (req.user.role === 'staff' && ticket.assignedTo && ticket.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view assigned tickets.'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support ticket',
      error: error.message
    });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own tickets.'
      });
    }

    // Restrict customer updates
    if (req.user.role === 'customer') {
      const allowedFields = ['description', 'contactMethod'];
      const updateKeys = Object.keys(updates);
      const isAllowed = updateKeys.every(key => allowedFields.includes(key));
      
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Customers can only update description and contact method'
        });
      }
    }

    // Track status changes for analytics
    if (updates.status && updates.status !== ticket.status) {
      ticket.analytics.statusHistory.push({
        status: updates.status,
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: updates.statusNotes || `Status changed to ${updates.status}`
      });

      // Update response/resolution times
      if (updates.status === 'in_progress' && !ticket.analytics.firstResponseTime) {
        ticket.analytics.firstResponseTime = new Date();
      }

      if (['resolved', 'closed'].includes(updates.status) && !ticket.analytics.resolutionTime) {
        ticket.analytics.resolutionTime = new Date();
      }
    }

    // Handle assignment changes
    if (updates.assignedTo && updates.assignedTo !== ticket.assignedTo?.toString()) {
      ticket.analytics.assignmentHistory.push({
        assignedTo: updates.assignedTo,
        assignedBy: req.user.id,
        assignedAt: new Date(),
        notes: updates.assignmentNotes || 'Ticket reassigned'
      });

      // Send notification to new assignee
      await sendNotification(updates.assignedTo, {
        type: 'ticket_assigned',
        title: 'Support Ticket Assigned',
        message: `You have been assigned ticket #${ticket.ticketNumber}: ${ticket.subject}`,
        data: { ticketId: ticket._id }
      });
    }

    Object.assign(ticket, updates);
    ticket.lastUpdated = new Date();
    ticket.lastUpdatedBy = req.user.id;

    await ticket.save();

    await ticket.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email department' },
      { path: 'relatedOrder', select: 'orderNumber totalAmount status' }
    ]);

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support ticket',
      error: error.message
    });
  }
};

// Add response to ticket
const addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternal = false, attachments = [] } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Customers cannot send internal messages
    if (req.user.role === 'customer' && isInternal) {
      return res.status(403).json({
        success: false,
        message: 'Customers cannot send internal messages'
      });
    }

    const response = {
      message,
      sentBy: req.user.id,
      isInternal,
      attachments,
      sentAt: new Date()
    };

    ticket.responses.push(response);

    // Update status if customer responds
    if (req.user.role === 'customer' && ticket.status === 'waiting_for_customer') {
      ticket.status = 'in_progress';
    }

    // Update first response time if this is the first staff response
    if (req.user.role !== 'customer' && !ticket.analytics.firstResponseTime) {
      ticket.analytics.firstResponseTime = new Date();
    }

    ticket.lastUpdated = new Date();
    ticket.lastUpdatedBy = req.user.id;

    await ticket.save();

    // Send notification if not internal message
    if (!isInternal) {
      const notifyUser = req.user.role === 'customer' ? ticket.assignedTo : ticket.createdBy;
      if (notifyUser) {
        await sendNotification(notifyUser, {
          type: 'ticket_response',
          title: 'New Response on Support Ticket',
          message: `New response on ticket #${ticket.ticketNumber}`,
          data: { ticketId: ticket._id }
        });
      }
    }

    await ticket.populate([
      { path: 'responses.sentBy', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// Escalate ticket
const escalateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { escalateTo, reason, level } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check if user can escalate
    if (req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Customers cannot escalate tickets directly'
      });
    }

    const escalation = {
      level: level || (ticket.escalations.length + 1),
      escalatedTo,
      escalatedBy: req.user.id,
      reason,
      escalatedAt: new Date()
    };

    ticket.escalations.push(escalation);
    ticket.priority = getEscalatedPriority(ticket.priority, escalation.level);
    ticket.assignedTo = escalateTo;
    ticket.status = 'escalated';

    // Update SLA if this is a higher priority escalation
    if (escalation.level >= 2) {
      ticket.sla.escalationDeadline = new Date(Date.now() + (4 * 60 * 60 * 1000)); // 4 hours
    }

    await ticket.save();

    // Send notification to escalated user
    await sendNotification(escalateTo, {
      type: 'ticket_escalated',
      title: 'Support Ticket Escalated',
      message: `Ticket #${ticket.ticketNumber} has been escalated to you. Priority: ${ticket.priority}`,
      data: { ticketId: ticket._id, level: escalation.level }
    });

    await ticket.populate([
      { path: 'escalations.escalatedTo', select: 'firstName lastName email department' },
      { path: 'escalations.escalatedBy', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email department' }
    ]);

    res.json({
      success: true,
      message: 'Ticket escalated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error escalating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate ticket',
      error: error.message
    });
  }
};

// Get ticket analytics
const getTicketAnalytics = async (req, res) => {
  try {
    const { period = '30', startDate, endDate, department, agent } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const days = parseInt(period);
      dateFilter = {
        createdAt: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };
    }

    let filter = { ...dateFilter };
    if (department) filter['assignedTo.department'] = department;
    if (agent) filter.assignedTo = agent;

    // Total tickets
    const totalTickets = await SupportTicket.countDocuments(filter);

    // Tickets by status
    const ticketsByStatus = await SupportTicket.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Tickets by category
    const ticketsByCategory = await SupportTicket.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Tickets by priority
    const ticketsByPriority = await SupportTicket.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Average response time
    const avgResponseTime = await SupportTicket.aggregate([
      { $match: { ...filter, 'analytics.firstResponseTime': { $exists: true } } },
      {
        $project: {
          responseTime: {
            $subtract: ['$analytics.firstResponseTime', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    // Average resolution time
    const avgResolutionTime = await SupportTicket.aggregate([
      { $match: { ...filter, 'analytics.resolutionTime': { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$analytics.resolutionTime', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    // Customer satisfaction
    const customerSatisfaction = await SupportTicket.aggregate([
      { $match: { ...filter, 'customerFeedback.rating': { $exists: true } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$customerFeedback.rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    // SLA compliance
    const slaCompliance = await SupportTicket.aggregate([
      { $match: filter },
      {
        $project: {
          slaBreached: {
            $cond: [
              { $gt: ['$analytics.resolutionTime', '$sla.responseDeadline'] },
              1,
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          breachedTickets: { $sum: '$slaBreached' }
        }
      },
      {
        $project: {
          complianceRate: {
            $multiply: [
              { $divide: [{ $subtract: ['$totalTickets', '$breachedTickets'] }, '$totalTickets'] },
              100
            ]
          }
        }
      }
    ]);

    // Top performing agents
    const topAgents = await SupportTicket.aggregate([
      { $match: { ...filter, assignedTo: { $exists: true } } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: '$agent' },
      {
        $group: {
          _id: '$assignedTo',
          name: { $first: { $concat: ['$agent.firstName', ' ', '$agent.lastName'] } },
          ticketsHandled: { $sum: 1 },
          avgRating: { $avg: '$customerFeedback.rating' },
          resolvedTickets: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          name: 1,
          ticketsHandled: 1,
          avgRating: { $round: ['$avgRating', 2] },
          resolutionRate: {
            $round: [
              { $multiply: [{ $divide: ['$resolvedTickets', '$ticketsHandled'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { resolutionRate: -1, avgRating: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalTickets,
          avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
          avgResolutionTime: avgResolutionTime[0]?.avgResolutionTime || 0,
          customerSatisfaction: customerSatisfaction[0] || { avgRating: 0, totalRatings: 0 },
          slaCompliance: slaCompliance[0]?.complianceRate || 0
        },
        breakdowns: {
          byStatus: ticketsByStatus,
          byCategory: ticketsByCategory,
          byPriority: ticketsByPriority
        },
        topAgents
      }
    });
  } catch (error) {
    console.error('Error fetching ticket analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket analytics',
      error: error.message
    });
  }
};

// Submit customer feedback
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check if customer owns the ticket
    if (ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if ticket is resolved or closed
    if (!['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for resolved or closed tickets'
      });
    }

    ticket.customerFeedback = {
      rating,
      feedback,
      submittedAt: new Date()
    };

    await ticket.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: ticket.customerFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Helper functions
const autoAssignAgent = async (category) => {
  try {
    // Find available agents in the relevant department
    const agents = await User.find({
      role: 'staff',
      department: getCategoryDepartment(category),
      isActive: true
    });

    if (agents.length === 0) return null;

    // Simple round-robin assignment based on current workload
    const agentWorkloads = await Promise.all(
      agents.map(async (agent) => {
        const activeTickets = await SupportTicket.countDocuments({
          assignedTo: agent._id,
          status: { $in: ['open', 'in_progress', 'assigned'] }
        });
        return { agent, workload: activeTickets };
      })
    );

    // Sort by workload and return agent with least workload
    agentWorkloads.sort((a, b) => a.workload - b.workload);
    return agentWorkloads[0].agent;
  } catch (error) {
    console.error('Error in auto assignment:', error);
    return null;
  }
};

const getCategoryDepartment = (category) => {
  const departmentMap = {
    'technical': 'technical_support',
    'billing': 'billing',
    'product': 'product_support',
    'delivery': 'logistics',
    'general': 'customer_service',
    'complaint': 'customer_service'
  };
  return departmentMap[category] || 'customer_service';
};

const getEscalatedPriority = (currentPriority, escalationLevel) => {
  const priorities = ['low', 'medium', 'high', 'urgent', 'emergency'];
  const currentIndex = priorities.indexOf(currentPriority);
  const newIndex = Math.min(currentIndex + escalationLevel, priorities.length - 1);
  return priorities[newIndex];
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  addResponse,
  escalateTicket,
  getTicketAnalytics,
  submitFeedback
};
