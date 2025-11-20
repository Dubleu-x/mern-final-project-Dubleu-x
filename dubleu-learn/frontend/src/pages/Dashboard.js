import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [coursesResponse, assignmentsResponse] = await Promise.all([
        api.get('/api/courses/my-courses'),
        api.get('/api/assignments/upcoming')
      ]);
      
      setCourses(coursesResponse.data);
      setUpcomingAssignments(assignmentsResponse.data);
      
      // Calculate basic stats
      const courseStats = {
        totalCourses: coursesResponse.data.length,
        activeCourses: coursesResponse.data.filter(course => course.status === 'active').length,
        totalAssignments: assignmentsResponse.data.length
      };
      setStats(courseStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.profile?.firstName}!</h1>
        <p>Here's what's happening in your classes</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalCourses || 0}</h3>
            <p>Total Courses</p>
          </div>
          <div className="stat-card">
            <h3>{stats.activeCourses || 0}</h3>
            <p>Active Courses</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalAssignments || 0}</h3>
            <p>Upcoming Assignments</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="courses-section">
          <h2>My Courses</h2>
          {courses.length > 0 ? (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span className="subject-badge">{course.subject}</span>
                    <span className="teacher-name">
                      {course.teacher?.profile?.firstName} {course.teacher?.profile?.lastName}
                    </span>
                  </div>
                  <div className="course-stats">
                    <span>Status: {course.status}</span>
                    <span>Students: {course.students?.length || 0}</span>
                  </div>
                  <Link to={`/courses/${course._id}`} className="view-course-btn">
                    View Course
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>You are not enrolled in any courses yet.</p>
              <Link to="/courses" className="browse-courses-btn">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
        
        <div className="assignments-section">
          <h2>Upcoming Assignments</h2>
          {upcomingAssignments.length > 0 ? (
            upcomingAssignments.map(assignment => (
              <div key={assignment._id} className="assignment-item">
                <h4>{assignment.title}</h4>
                <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                <p>Course: {assignment.courseId?.title}</p>
                <span className="points-badge">{assignment.maxPoints} points</span>
              </div>
            ))
          ) : (
            <p>No upcoming assignments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;