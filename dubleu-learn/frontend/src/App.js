import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // ADD THIS IMPORT
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCourse from './pages/CreateCourse';
import CreateAssignment from './pages/CreateAssignment';
import CreateLesson from './pages/CreateLesson';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import api, { testBackendConnection } from './services/api';
import './App.css';

function App() {
  useEffect(() => {
    // Test backend connection on app start
    testBackendConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/courses" element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } />
              <Route path="/courses/:id" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />
              <Route path="/create-course" element={
                <ProtectedRoute requiredRole="teacher">
                  <CreateCourse />
                </ProtectedRoute>
              } />
              <Route path="/courses/:id/create-lesson" element={
                <ProtectedRoute requiredRole="teacher">
                  <CreateLesson />
                </ProtectedRoute>
              } />
              <Route path="/courses/:id/create-assignment" element={
                <ProtectedRoute requiredRole="teacher">
                  <CreateAssignment />
                </ProtectedRoute>
              } />
              <Route path="/assignments/:id/submissions" element={
                <ProtectedRoute requiredRole="teacher">
                  <AssignmentSubmissions />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          {/* ADD FOOTER HERE */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;