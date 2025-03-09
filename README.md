# Event Management System API

A RESTful API built with Node.js for managing events, user registrations, and event invitations.

## Features

- User Authentication (Register/Login)
- Event Management (Create, Read, Update, Delete)
- Event Invitations with Encrypted Links
- Email Notifications
- User Role Management (Admin/User)
- Event Approval System

## Prerequisites

Before running this project, make sure you have installed:

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone https://github.com/musmmarR/event-mangment-serve.git
cd event-mangment-serve
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=http://your-frontend-url
CRYPTO_SECRET_KEY=your_encryption_key
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Verify email

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join event
- `GET /api/events/pending` - Get pending events
- `PUT /api/events/:id/approve` - Approve event
- `PUT /api/events/:id/reject` - Reject event

## Project Structure
