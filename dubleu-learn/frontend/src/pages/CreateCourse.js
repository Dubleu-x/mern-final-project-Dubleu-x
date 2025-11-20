import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CreateCourse.css';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    syllabus: '',
    startDate: '',
    endDate: '',
    learningObjectives: [''],
    requirements: ['']
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Filter out empty array items
      const submissionData = {
        ...formData,
        learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
        requirements: formData.requirements.filter(req => req.trim() !== '')
      };

      const response = await api.post('/api/courses', submissionData);
      navigate(`/courses/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course">
      <div className="create-course-header">
        <h1>Create New Course</h1>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Course Title *</label>
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
          <label htmlFor="description">Course Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select Subject</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
              <option value="art">Art</option>
              <option value="music">Music</option>
              <option value="pe">Physical Education</option>
              <option value="technology">Technology</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="syllabus">Course Syllabus</label>
          <textarea
            id="syllabus"
            name="syllabus"
            value={formData.syllabus}
            onChange={handleChange}
            rows="6"
            placeholder="Describe the course structure, topics covered, and schedule..."
          />
        </div>

        <div className="form-group">
          <label>Learning Objectives</label>
          {formData.learningObjectives.map((objective, index) => (
            <div key={index} className="array-input-group">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleArrayChange('learningObjectives', index, e.target.value)}
                placeholder="Enter a learning objective"
              />
              {formData.learningObjectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('learningObjectives', index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('learningObjectives')}
            className="add-btn"
          >
            Add Objective
          </button>
        </div>

        <div className="form-group">
          <label>Requirements</label>
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="array-input-group">
              <input
                type="text"
                value={requirement}
                onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                placeholder="Enter a course requirement"
              />
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('requirements', index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('requirements')}
            className="add-btn"
          >
            Add Requirement
          </button>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Course...' : 'Create Course'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/courses')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;