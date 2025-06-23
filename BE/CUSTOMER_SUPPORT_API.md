# Customer Support API Documentation

## Overview
The Customer Support API provides a comprehensive ticketing system for managing customer inquiries, complaints, technical support requests, and service issues with advanced features like escalation, SLA tracking, and analytics.

## Base URL
```
/api/support
```

## Authentication
Most endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

Some endpoints (like creating guest tickets) support optional authentication.

## Endpoints

### 1. Get All Support Tickets

**GET** `/api/support/tickets`

Get a paginated list of support tickets with filtering options.

**Access:** Private (Admin/Manager/Staff see all, Customers see their own)

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category
- `priority` (string, optional): Filter by priority
- `assignedTo` (string, optional): Filter by assigned agent ID
- `search` (string, optional): Search in subject, description, or ticket number
- `sortBy` (string, optional): Sort field ('createdAt', 'lastUpdated', 'priority', 'status')
- `sortOrder` (string, optional): Sort order ('asc', 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "ticket_id",
        "ticketNumber": "TKT-2024-001234",
        "subject": "Product delivery issue",
        "description": "My order hasn't arrived yet",
        "category": "delivery",
        "priority": "medium",
        "status": "in_progress",
        "createdBy": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@email.com"
        },
        "assignedTo": {
          "_id": "agent_id",
          "firstName": "Agent",
          "lastName": "Smith",
          "department": "logistics"
        },
        "relatedOrder": {
          "_id": "order_id",
          "orderNumber": "ORD-2024-001",
          "totalAmount": 1500,
          "status": "shipped"
        },
        "contactMethod": "email",
        "createdAt": "2024-01-20T10:00:00.000Z",
        "lastUpdated": "2024-01-20T14:30:00.000Z",
        "sla": {
          "responseDeadline": "2024-01-20T14:00:00.000Z",
          "resolutionDeadline": "2024-01-22T10:00:00.000Z"
        }
      }
    ],
    "totalDocs": 150,
    "limit": 10,
    "page": 1,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Ticket by ID

**GET** `/api/support/tickets/:id`

Get detailed information about a specific support ticket.

**Access:** Private (Ticket owner, assigned agent, or admin/manager)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ticket_id",
    "ticketNumber": "TKT-2024-001234",
    "subject": "Product delivery issue",
    "description": "My order #ORD-2024-001 was supposed to arrive yesterday but hasn't been delivered yet.",
    "category": "delivery",
    "priority": "medium",
    "status": "in_progress",
    "createdBy": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com"
    },
    "assignedTo": {
      "_id": "agent_id",
      "firstName": "Agent",
      "lastName": "Smith",
      "email": "agent.smith@furnstore.com",
      "department": "logistics"
    },
    "relatedOrder": {
      "_id": "order_id",
      "orderNumber": "ORD-2024-001",
      "totalAmount": 1500,
      "status": "shipped",
      "createdAt": "2024-01-15T00:00:00.000Z"
    },
    "contactMethod": "email",
    "responses": [
      {
        "_id": "response_id",
        "message": "Thank you for contacting us. I'm looking into your delivery status now.",
        "sentBy": {
          "_id": "agent_id",
          "firstName": "Agent",
          "lastName": "Smith"
        },
        "isInternal": false,
        "sentAt": "2024-01-20T11:00:00.000Z"
      }
    ],
    "escalations": [],
    "sla": {
      "responseDeadline": "2024-01-20T14:00:00.000Z",
      "resolutionDeadline": "2024-01-22T10:00:00.000Z",
      "escalationDeadline": null
    },
    "analytics": {
      "firstResponseTime": "2024-01-20T11:00:00.000Z",
      "resolutionTime": null,
      "statusHistory": [
        {
          "status": "open",
          "changedAt": "2024-01-20T10:00:00.000Z",
          "changedBy": "system"
        },
        {
          "status": "assigned",
          "changedAt": "2024-01-20T10:15:00.000Z",
          "changedBy": "manager_id"
        }
      ]
    },
    "createdAt": "2024-01-20T10:00:00.000Z",
    "lastUpdated": "2024-01-20T14:30:00.000Z"
  }
}
```

### 3. Create Support Ticket

**POST** `/api/support/tickets`

Create a new support ticket.

**Access:** Private (Authenticated users) / Public (Guest with contact info)

**Request Body:**
```json
{
  "subject": "Product delivery issue",
  "description": "My order #ORD-2024-001 was supposed to arrive yesterday but hasn't been delivered yet. Could you please check the status?",
  "category": "delivery",
  "priority": "medium",
  "orderId": "order_id_if_related",
  "contactMethod": "email",
  "customerInfo": {  // Required for guest users only
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+1-555-0123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "_id": "new_ticket_id",
    "ticketNumber": "TKT-2024-001235",
    "subject": "Product delivery issue",
    "status": "assigned",
    "assignedTo": {
      "_id": "agent_id",
      "firstName": "Agent",
      "lastName": "Smith"
    },
    /* ... full ticket object ... */
  }
}
```

### 4. Update Support Ticket

**PUT** `/api/support/tickets/:id`

Update a support ticket.

**Access:** Private (Ticket owner has limited access, staff/admin have full access)

**Request Body:**
```json
{
  "subject": "Updated subject",
  "description": "Updated description with more details",
  "priority": "high",
  "status": "in_progress",
  "assignedTo": "new_agent_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Support ticket updated successfully",
  "data": {
    /* ... updated ticket object ... */
  }
}
```

### 5. Add Response to Ticket

**POST** `/api/support/tickets/:id/responses`

Add a response/message to a support ticket.

**Access:** Private (Ticket owner, assigned agent, or admin/manager)

**Request Body:**
```json
{
  "message": "I've checked with our logistics team and your order is currently out for delivery. You should receive it by end of day today.",
  "isInternal": false,
  "attachments": [
    {
      "filename": "tracking_details.pdf",
      "url": "https://storage.example.com/files/tracking_details.pdf",
      "size": 245760
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    /* ... updated ticket object with new response ... */
  }
}
```

### 6. Escalate Ticket

**POST** `/api/support/tickets/:id/escalate`

Escalate a support ticket to a higher level or different department.

**Access:** Private (Staff/Manager/Admin only)

**Request Body:**
```json
{
  "escalateTo": "senior_agent_id",
  "reason": "Customer requesting manager involvement due to unsatisfactory resolution attempt",
  "level": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket escalated successfully",
  "data": {
    "_id": "ticket_id",
    "priority": "high",
    "status": "escalated",
    "assignedTo": {
      "_id": "senior_agent_id",
      "firstName": "Senior",
      "lastName": "Agent"
    },
    "escalations": [
      {
        "level": 2,
        "escalatedTo": {
          "_id": "senior_agent_id",
          "firstName": "Senior",
          "lastName": "Agent",
          "department": "customer_service"
        },
        "escalatedBy": {
          "_id": "agent_id",
          "firstName": "Agent",
          "lastName": "Smith"
        },
        "reason": "Customer requesting manager involvement",
        "escalatedAt": "2024-01-20T15:00:00.000Z"
      }
    ]
  }
}
```

### 7. Submit Customer Feedback

**POST** `/api/support/tickets/:id/feedback`

Submit customer feedback for a resolved ticket.

**Access:** Private (Ticket owner only)

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Excellent service! The agent was very helpful and resolved my issue quickly."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "rating": 5,
    "feedback": "Excellent service! The agent was very helpful and resolved my issue quickly.",
    "submittedAt": "2024-01-22T16:00:00.000Z"
  }
}
```

### 8. Update Ticket Status

**PATCH** `/api/support/tickets/:id/status`

Update only the status of a ticket.

**Access:** Private (Staff/Manager/Admin only)

**Request Body:**
```json
{
  "status": "resolved",
  "statusNotes": "Issue resolved after contacting logistics partner"
}
```

### 9. Assign Ticket

**PATCH** `/api/support/tickets/:id/assign`

Assign a ticket to a specific agent.

**Access:** Private (Manager/Admin only)

**Request Body:**
```json
{
  "assignedTo": "agent_user_id",
  "assignmentNotes": "Assigning to specialist with delivery expertise"
}
```

### 10. Update Ticket Priority

**PATCH** `/api/support/tickets/:id/priority`

Update the priority of a ticket.

**Access:** Private (Staff/Manager/Admin only)

**Request Body:**
```json
{
  "priority": "urgent",
  "priorityNotes": "Customer is VIP, escalating priority"
}
```

### 11. Get Ticket Analytics

**GET** `/api/support/analytics`

Get comprehensive analytics and metrics for support tickets.

**Access:** Private (Admin/Manager only)

**Query Parameters:**
- `period` (number, optional): Number of days to analyze (default: 30, max: 365)
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)
- `department` (string, optional): Filter by department
- `agent` (string, optional): Filter by specific agent ID

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTickets": 1250,
      "avgResponseTime": 3600000,  // milliseconds
      "avgResolutionTime": 86400000,  // milliseconds
      "customerSatisfaction": {
        "avgRating": 4.2,
        "totalRatings": 892
      },
      "slaCompliance": 87.5
    },
    "breakdowns": {
      "byStatus": [
        { "_id": "open", "count": 45 },
        { "_id": "in_progress", "count": 78 },
        { "_id": "resolved", "count": 980 },
        { "_id": "closed", "count": 147 }
      ],
      "byCategory": [
        { "_id": "technical", "count": 425 },
        { "_id": "billing", "count": 302 },
        { "_id": "delivery", "count": 289 },
        { "_id": "product", "count": 234 }
      ],
      "byPriority": [
        { "_id": "low", "count": 345 },
        { "_id": "medium", "count": 567 },
        { "_id": "high", "count": 278 },
        { "_id": "urgent", "count": 60 }
      ]
    },
    "topAgents": [
      {
        "_id": "agent_id",
        "name": "Jane Smith",
        "ticketsHandled": 156,
        "avgRating": 4.6,
        "resolutionRate": 94.2
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### Support Ticket Object
```javascript
{
  _id: ObjectId,
  ticketNumber: String, // Auto-generated: TKT-YYYY-XXXXXX
  subject: String,
  description: String,
  category: String, // 'technical', 'billing', 'product', 'delivery', 'general', 'complaint'
  priority: String, // 'low', 'medium', 'high', 'urgent', 'emergency'
  status: String, // 'open', 'assigned', 'in_progress', 'waiting_for_customer', 'escalated', 'resolved', 'closed'
  createdBy: ObjectId, // User reference
  assignedTo: ObjectId, // User reference (agent)
  relatedOrder: ObjectId, // Order reference (optional)
  contactMethod: String, // 'email', 'phone', 'chat', 'in_person'
  customerInfo: { // For guest tickets
    name: String,
    email: String,
    phone: String
  },
  responses: [{
    message: String,
    sentBy: ObjectId,
    isInternal: Boolean,
    attachments: [{
      filename: String,
      url: String,
      size: Number
    }],
    sentAt: Date
  }],
  escalations: [{
    level: Number,
    escalatedTo: ObjectId,
    escalatedBy: ObjectId,
    reason: String,
    escalatedAt: Date
  }],
  sla: {
    responseDeadline: Date,
    resolutionDeadline: Date,
    escalationDeadline: Date
  },
  analytics: {
    firstResponseTime: Date,
    resolutionTime: Date,
    statusHistory: [{
      status: String,
      changedBy: ObjectId,
      changedAt: Date,
      notes: String
    }],
    assignmentHistory: [{
      assignedTo: ObjectId,
      assignedBy: ObjectId,
      assignedAt: Date,
      notes: String
    }]
  },
  customerFeedback: {
    rating: Number, // 1-5
    feedback: String,
    submittedAt: Date
  },
  tags: [String],
  createdAt: Date,
  lastUpdated: Date,
  lastUpdatedBy: ObjectId
}
```

## Validation Rules

### Ticket Creation
- `subject`: Required, max 200 characters
- `description`: Required, max 5000 characters
- `category`: Required, must be valid category
- `priority`: Optional, defaults to 'medium'
- `contactMethod`: Optional, defaults to 'email'

### Customer Info (Guest Tickets)
- `name`: Required for guest tickets
- `email`: Required for guest tickets, valid email format
- `phone`: Optional, valid phone format if provided

### Responses
- `message`: Required, max 5000 characters
- `isInternal`: Optional, boolean
- `attachments`: Optional array of file objects

### Feedback
- `rating`: Required, integer 1-5
- `feedback`: Optional, max 1000 characters

## SLA (Service Level Agreement)

### Response Times by Priority
- **Low**: 24 hours
- **Medium**: 8 hours
- **High**: 4 hours
- **Urgent**: 2 hours
- **Emergency**: 1 hour

### Resolution Times by Priority
- **Low**: 7 days
- **Medium**: 3 days
- **High**: 2 days
- **Urgent**: 1 day
- **Emergency**: 4 hours

## Ticket Lifecycle

1. **Created** - Customer creates ticket (status: 'open')
2. **Assigned** - Auto-assigned or manually assigned to agent (status: 'assigned')
3. **In Progress** - Agent starts working on ticket (status: 'in_progress')
4. **Customer Response Needed** - Waiting for customer input (status: 'waiting_for_customer')
5. **Escalated** - Escalated to higher level (status: 'escalated')
6. **Resolved** - Issue resolved (status: 'resolved')
7. **Closed** - Ticket closed after confirmation (status: 'closed')

## Auto-Assignment Logic

Tickets are automatically assigned based on:
- Category → Department mapping
- Agent workload (current active tickets)
- Agent availability and working hours
- Agent expertise/skills (future enhancement)

## Escalation Triggers

Automatic escalation occurs when:
- SLA deadlines are missed
- Customer explicitly requests escalation
- Agent manually escalates
- Emergency priority tickets
- Multiple unresolved tickets from same customer

## Notes

- All timestamps are in UTC
- File attachments are stored in cloud storage
- Internal responses are not visible to customers
- Ticket numbers are unique and sequential
- Email notifications are sent for all status changes
- Analytics are updated in real-time
- SLA tracking includes business hours only
