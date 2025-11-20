import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CreateAssignment.css';

const CreateAssignment = () => {
  const { id: courseId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100,
    assignmentType: 'homework',
    allowedSubmissions: 'single'
  });
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/api/courses/${courseId}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const assignmentData = {
        ...formData,
        courseId,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      await api.post('/api/assignments', assignmentData);
      navigate(`/courses/${courseId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return <div className="loading">Loading course...</div>;
  }

  return (
    <div className="create-assignment">
      <div className="create-assignment-header">
        <h1>Create New Assignment</h1>
        <p>For course: <strong>{course.title}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="assignment-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Assignment Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="6"
            placeholder="Provide detailed instructions for students..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxPoints">Maximum Points *</label>
            <input
              type="number"
              id="maxPoints"
              name="maxPoints"
              value={formData.maxPoints}
              onChange={handleChange}
              min="0"
              max="1000"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="assignmentType">Assignment Type *</label>
            <select
              id="assignmentType"
              name="assignmentType"
              value={formData.assignmentType}
              onChange={handleChange}
              required
            >
              <option value="homework">Homework</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
              <option value="exam">Exam</option>
              <option value="discussion">Discussion</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="allowedSubmissions">Submission Type *</label>
            <select
              id="allowedSubmissions"
              name="allowedSubmissions"
              value={formData.allowedSubmissions}
              onChange={handleChange}
              required
            >
              <option value="single">Single Submission</option>
              <option value="multiple">Multiple Submissions</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Assignment...' : 'Create Assignment'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment;