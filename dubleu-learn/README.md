# DubleuLearn - E-Learning Platform

A comprehensive MERN stack e-learning platform for Dubleu High School.

## 🚀 Features

- **User Management**: Student, Teacher, and Admin roles
- **Course Management**: Create, enroll, and manage courses
- **Content Delivery**: Lessons with multimedia support
- **Assignment System**: Submit and grade assignments
- **Real-time Communication**: Chat and notifications
- **Progress Tracking**: Monitor student progress

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Context API for state management
- Axios for API calls
- Socket.io-client for real-time features

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- bcryptjs for password hashing

### Testing & Deployment
- Jest for backend testing
- React Testing Library for frontend testing
- Docker for containerization
- GitHub Actions for CI/CD

## 📦 Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev