# Team Task Manager

A full-stack task management application with role-based access control (Admin/Member), project management, and task tracking.

## Features

- **Authentication**: JWT-based signup and login
- **Role-based Access**: Admin and Member roles with different permissions
- **Project Management**: Create, read, update, delete projects
- **Task Management**: Create tasks, assign to team members, track status
- **Dashboard**: Overview of projects, tasks, and overdue items
- **Real-time Updates**: Instant status updates and task management

## Tech Stack

- **Frontend**: React.js, React Router, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Styling**: Custom CSS with modern design
- **Deployment**: Railway

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
