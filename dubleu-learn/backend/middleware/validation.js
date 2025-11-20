const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const courseValidation = {
  create: [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('subject').isIn(['math', 'science', 'english', 'history', 'art', 'music', 'pe', 'technology']).withMessage('Invalid subject'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    handleValidationErrors
  ]
};

const userValidation = {
  register: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('profile.firstName').notEmpty().withMessage('First name is required'),
    body('profile.lastName').notEmpty().withMessage('Last name is required'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  courseValidation,
  userValidation
};