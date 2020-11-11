require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('return todo items for single user', async() => {

      const expectation = [
        {
          'id': 1,
          'task': 'dust',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 2,
          'task': 'vacuum',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 3,
          'task': 'laundry',
          'completed': false,
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('return one task for single user', async() => {

      const expectation = [
        {
          'id': 4,
          'task': 'sweep',
          'completed': false,
          'owner_id': 2
        }
      ];

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send({
          'task': 'sweep',
          'completed': false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
