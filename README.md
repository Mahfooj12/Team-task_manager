=========================================
                    TEAM TASK MANAGER - FULL STACK MERN APP
=========================================

A complete task management application with role-based access control (Admin/Member),
project management, and task tracking.

=========================================
                                  FEATURES
================================================================================

1. AUTHENTICATION
   - JWT-based Signup and Login
   - Secure password hashing with bcryptjs
   - Protected routes with authentication middleware

2. ROLE-BASED ACCESS CONTROL
   - ADMIN: Full access - Create, Update, Delete any project/task
   - MEMBER: Limited access - View assigned projects, update task status

3. PROJECT MANAGEMENT
   - Create new projects with name and description
   - View all projects
   - Edit project details
   - Delete projects (Admin only)
   - Project status: Active, On Hold, Completed

4. TASK MANAGEMENT
   - Create tasks with title, description, due date
   - Assign tasks to team members
   - Set priority levels: Low, Medium, High, Urgent
   - Task status: Pending, In Progress, Completed
   - Update task status in real-time
   - Delete tasks

5. DASHBOARD
   - Overview statistics (Total Projects, Tasks, Completed, Overdue)
   - Tasks grouped by status
   - Recent projects list

=========================================
                            TECHNOLOGY STACK
================================================================================

FRONTEND:
   - React.js 18
   - React Router DOM v6
   - Axios for API calls
   - React Hot Toast for notifications
   - date-fns for date formatting
   - Vite as build tool

BACKEND:
   - Node.js
   - Express.js
   - MongoDB with Mongoose ODM
   - JWT for authentication
   - bcryptjs for password hashing
   - CORS enabled

DEPLOYMENT:
   - Railway (Backend + Frontend)
   - MongoDB Atlas (Database)

=========================================
                          INSTALLATION GUIDE
================================================================================

PREREQUISITES:
   - Node.js (v18 or higher)
   - MongoDB Atlas account (or local MongoDB)
   - Git

STEP 1: CLONE THE REPOSITORY
   git clone https://github.com/Mahfooj12/task-manager.git
   cd task-manager

STEP 2: BACKEND SETUP
   cd backend
   npm install
   Create .env file with:
      PORT=5000
      MONGODB_URI=your_mongodb_connection_string
      JWT_SECRET=your_secret_key
      NODE_ENV=development
   npm run dev

STEP 3: FRONTEND SETUP
   Open new terminal
   cd frontend
   npm install
   Create .env file with:
      VITE_API_URL=http://localhost:5000/api
   npm run dev

STEP 4: ACCESS THE APPLICATION
   Frontend: http://localhost:3000
   Backend API: http://localhost:5000

=========================================
                              API ENDPOINTS
================================================================================

AUTHENTICATION:
   POST   /api/auth/signup     - Register new user
   POST   /api/auth/login      - Login user
   GET    /api/auth/me         - Get current user

PROJECTS:
   GET    /api/projects        - Get all projects
   POST   /api/projects        - Create new project
   PUT    /api/projects/:id    - Update project
   DELETE /api/projects/:id    - Delete project

TASKS:
   GET    /api/tasks           - Get all tasks
   POST   /api/tasks           - Create new task
   PATCH  /api/tasks/:id/status - Update task status
   DELETE /api/tasks/:id       - Delete task

USERS:
   GET    /api/users           - Get all users (Admin only)

=========================================
                           ENVIRONMENT VARIABLES
================================================================================

BACKEND (.env):
   PORT                 - Server port (default: 5000)
   MONGODB_URI          - MongoDB connection string
   JWT_SECRET           - Secret key for JWT tokens
   NODE_ENV             - development/production

FRONTEND (.env):
   VITE_API_URL         - Backend API URL

=========================================
                              DATABASE SCHEMA
================================================================================

USER:
   - name (String, required)
   - email (String, required, unique)
   - password (String, required, hashed)
   - role (String: Admin/Member, default: Member)
   - createdAt (Date)

PROJECT:
   - name (String, required)
   - description (String, required)
   - owner (ObjectId, ref: User)
   - members (Array, ref: User)
   - status (String: Active/Completed/On Hold)

TASK:
   - title (String, required)
   - description (String, required)
   - project (ObjectId, ref: Project)
   - assignedTo (ObjectId, ref: User)
   - assignedBy (ObjectId, ref: User)
   - status (String: Pending/In Progress/Completed)
   - priority (String: Low/Medium/High/Urgent)
   - dueDate (Date)

=========================================
                              DEPLOYMENT
================================================================================

DEPLOYED ON: Railway

BACKEND URL: https://backend-production-xxxx.up.railway.app
FRONTEND URL: https://mohd-mahfooj-020f.up.railway.app

GITHUB REPOSITORY: https://github.com/Mahfooj12/Team-task_manager

=========================================
                              TEST CREDENTIALS
================================================================================

ADMIN USER (First user becomes Admin):
   Email: admin@example.com
   Password: admin123

MEMBER USER:
   Email: member@example.com
   Password: member123

=====================================
                              CONTACT & SUPPORT
================================================================================

Developer: Mohammad Mahfooj
GitHub: https://github.com/Mahfooj12
Project Repository: https://github.com/Mahfooj12/Team-task_manager

=======================================
                                CONCLUSION
================================================================================

Team Task Manager is a fully functional MERN stack application that helps teams
manage projects and tasks efficiently with proper role-based access control.

Thank you for reviewing this project!

========================================
# Update .env with your MongoDB URI and JWT secret
npm run dev
