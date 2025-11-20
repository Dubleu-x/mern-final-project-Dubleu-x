import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AssignmentSubmissions.css';

const AssignmentSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const fetchAssignmentData = async () => {
    try {
      console.log('📋 Fetching assignment submissions for ID:', id);
      
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        api.get(`/api/assignments/${id}`),
        api.get(`/api/assignments/${id}/submissions`)
      ]);

      console.log('✅ Assignment data:', assignmentResponse.data);
      console.log('✅ Submissions data:', submissionsResponse.data);
      
      setAssignment(assignmentResponse.data);
      setSubmissions(submissionsResponse.data);
    } catch (error) {
      console.error('❌ Error fetching assignment data:', error);
      alert('Error loading submissions: ' + (error.response?.data?.message || error.message));
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGrading(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleGradeSubmission = async (submissionId) => {
    const gradeData = grading[submissionId];
    
    if (!gradeData || !gradeData.points) {
      alert('Please enter points for this submission');
      return;
    }

    try {
      console.log('🎯 Grading submission:', submissionId, gradeData);
      
      const response = await api.put(`/api/assignments/submissions/${submissionId}/grade`, {
        points: parseFloat(gradeData.points),
        feedback: gradeData.feedback || ''
      });

      console.log('✅ Grade submitted:', response.data);
      alert('Grade submitted successfully!');
      
      // Refresh submissions to show updated grades
      fetchAssignmentData();
      
      // Clear grading state for this submission
      setGrading(prev => {
        const newGrading = { ...prev };
        delete newGrading[submissionId];
        return newGrading;
      });
      
    } catch (error) {
      console.error('❌ Error grading submission:', error);
      alert('Failed to submit grade: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  if (!assignment) {
    return <div className="error">Assignment not found</div>;
  }

  return (
    <div className="assignment-submissions">
      <div className="submissions-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Grade Submissions: {assignment.title}</h1>
        <div className="assignment-info">
          <p><strong>Course:</strong> {assignment.courseId?.title}</p>
          <p><strong>Max Points:</strong> {assignment.maxPoints}</p>
          <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p><strong>Submissions:</strong> {submissions.length}</p>
        </div>
      </div>

      <div className="submissions-list">
        {submissions.length === 0 ? (
          <div className="no-submissions">
            <p>No submissions yet for this assignment.</p>
          </div>
        ) : (
          submissions.map(submission => (
            <div key={submission._id} className="submission-item">
              <div className="submission-header">
                <h3>
                  {submission.studentId.profile.firstName} {submission.studentId.profile.lastName}
                </h3>
                <span className={`submission-status ${submission.status}`}>
                  {submission.status}
                </span>
              </div>

              <div className="submission-content">
                <div className="submission-text">
                  <h4>Submission:</h4>
                  <p>{submission.textSubmission || 'No text submission provided.'}</p>
                </div>

                {submission.files && submission.files.length > 0 && (
                  <div className="submission-files">
                    <h4>Files:</h4>
                    <div className="file-list">
                      {submission.files.map((file, index) => (
                        <div key={index} className="file-item">
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            📎 {file.filename}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="submission-meta">
                  <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                  {submission.grade && (
                    <div className="current-grade">
                      <p><strong>Current Grade:</strong> {submission.grade.points}/{submission.grade.maxPoints}</p>
                      {submission.grade.feedback && (
                        <p><strong>Feedback:</strong> {submission.grade.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grading-form">
                <h4>Grade Submission:</h4>
                <div className="grade-inputs">
                  <div className="input-group">
                    <label>Points:</label>
                    <input
                      type="number"
                      min="0"
                      max={assignment.maxPoints}
                      step="0.5"
                      value={grading[submission._id]?.points || ''}
                      onChange={(e) => handleGradeChange(submission._id, 'points', e.target.value)}
                      placeholder={`0-${assignment.maxPoints}`}
                    />
                  </div>
                  <div className="input-group">
                    <label>Feedback:</label>
                    <textarea
                      value={grading[submission._id]?.feedback || ''}
                      onChange={(e) => handleGradeChange(submission._id, 'feedback', e.target.value)}
                      placeholder="Enter feedback for the student..."
                      rows="3"
                    />
                  </div>
                </div>
                <button
                  className="submit-grade-btn"
                  onClick={() => handleGradeSubmission(submission._id)}
                  disabled={!grading[submission._id]?.points}
                >
                  Submit Grade
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissions;