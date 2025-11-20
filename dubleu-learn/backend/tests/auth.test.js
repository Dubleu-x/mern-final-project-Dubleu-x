// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Authentication API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@dubleuhs.edu',
        password: 'password123',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          gradeLevel: '10'
        }
      })
      .expect(201);

    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('student@dubleuhs.edu');
  });

  test('should login existing user', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@dubleuhs.edu',
        password: 'password123',
        profile: { firstName: 'John', lastName: 'Doe' }
      });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@dubleuhs.edu',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.token).toBeDefined();
  });
});