const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');
const {
  validateTicketCreate,
  validateTicketUpdate,
  validateTicketId,
  validateTicketResponse,
  validateTicketEscalation,
  validateFeedback,
  validateAnalyticsQuery,
  validateTicketSearch
} = require('../middlewares/supportValidation');

// @route   GET /api/support/tickets
// @desc    Get all support tickets with filtering and pagination
// @access  Private (Admin/Manager/Staff can see all, Customers see their own)
router.get('/tickets', 
  authenticate, 
  validateTicketSearch,
  supportController.getAllTickets
);

// @route   GET /api/support/analytics
// @desc    Get support ticket analytics and metrics
// @access  Private (Admin/Manager only)
router.get('/analytics', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateAnalyticsQuery,
  supportController.getTicketAnalytics
);

// @route   GET /api/support/tickets/:id
// @desc    Get support ticket by ID
// @access  Private (Ticket owner, assigned agent, or admin/manager)
router.get('/tickets/:id', 
  authenticate, 
  validateTicketId,
  supportController.getTicketById
);

// @route   POST /api/support/tickets
// @desc    Create a new support ticket
// @access  Private (Authenticated users) / Public (Guest with contact info)
router.post('/tickets', 
  optionalAuth, // Allows both authenticated and guest users
  validateTicketCreate,
  supportController.createTicket
);

// @route   POST /api/support/tickets/:id/responses
// @desc    Add a response to a support ticket
// @access  Private (Ticket owner, assigned agent, or admin/manager)
router.post('/tickets/:id/responses', 
  authenticate, 
  validateTicketId,
  validateTicketResponse,
  supportController.addResponse
);

// @route   POST /api/support/tickets/:id/escalate
// @desc    Escalate a support ticket
// @access  Private (Staff/Manager/Admin only)
router.post('/tickets/:id/escalate', 
  authenticate, 
  authorize(['staff', 'manager', 'admin']), 
  validateTicketId,
  validateTicketEscalation,
  supportController.escalateTicket
);

// @route   POST /api/support/tickets/:id/feedback
// @desc    Submit customer feedback for a resolved ticket
// @access  Private (Ticket owner only)
router.post('/tickets/:id/feedback', 
  authenticate, 
  validateTicketId,
  validateFeedback,
  supportController.submitFeedback
);

// @route   PUT /api/support/tickets/:id
// @desc    Update a support ticket
// @access  Private (Ticket owner has limited access, staff/admin have full access)
router.put('/tickets/:id', 
  authenticate, 
  validateTicketId,
  validateTicketUpdate,
  supportController.updateTicket
);

// @route   PATCH /api/support/tickets/:id/status
// @desc    Update ticket status only
// @access  Private (Staff/Manager/Admin only)
router.patch('/tickets/:id/status', 
  authenticate, 
  authorize(['staff', 'manager', 'admin']), 
  validateTicketId,
  (req, res, next) => {
    // Validate status field specifically
    const { status } = req.body;
    const validStatuses = ['open', 'assigned', 'in_progress', 'waiting_for_customer', 'escalated', 'resolved', 'closed'];
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    next();
  },
  supportController.updateTicket
);

// @route   PATCH /api/support/tickets/:id/assign
// @desc    Assign ticket to an agent
// @access  Private (Manager/Admin only)
router.patch('/tickets/:id/assign', 
  authenticate, 
  authorize(['manager', 'admin']), 
  validateTicketId,
  (req, res, next) => {
    // Validate assignedTo field specifically
    const { assignedTo } = req.body;
    const mongoose = require('mongoose');
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'assignedTo field is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    next();
  },
  supportController.updateTicket
);

// @route   PATCH /api/support/tickets/:id/priority
// @desc    Update ticket priority
// @access  Private (Staff/Manager/Admin only)
router.patch('/tickets/:id/priority', 
  authenticate, 
  authorize(['staff', 'manager', 'admin']), 
  validateTicketId,
  (req, res, next) => {
    // Validate priority field specifically
    const { priority } = req.body;
    const validPriorities = ['low', 'medium', 'high', 'urgent', 'emergency'];
    
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required'
      });
    }
    
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }
    
    next();
  },
  supportController.updateTicket
);

module.exports = router;
