const assert = require('assert');
const mobileService = require('./server/Project/ivts/service/mobile');

// Mock axios
const axios = require('axios');
const originalPost = axios.post;
const originalGet = axios.get;

async function runTests() {
  console.log('Testing exchangeIamAuthCode...');
  let postCalled = false;
  let getCalled = false;

  axios.post = async function(url, data) {
    postCalled = true;
    assert.strictEqual(url, 'https://iam.mfu.ac.th/oauth/token');
    assert.strictEqual(data.grant_type, 'authorization_code');
    assert.strictEqual(data.code, 'fake_auth_code');
    assert.strictEqual(data.redirect_uri, 'ivtsapp://callback');
    assert.strictEqual(data.client_id, 'ivts-gateway-local');
    return { data: { access_token: 'fake_access_token' } };
  };

  axios.get = async function(url, options) {
    getCalled = true;
    assert.strictEqual(url, 'https://iam.mfu.ac.th/api/v1/auth/me');
    assert.strictEqual(options.headers.Authorization, 'Bearer fake_access_token');
    return {
      data: {
        data: {
          _id: 'user_123',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          role: 'user'
        }
      }
    };
  };

  try {
    process.env.PROJECT_IAM_MANAGED_CLIENT_ID = 'ivts-gateway-local';
    
    const result = await mobileService.exchangeIamAuthCode('fake_auth_code', 'ivtsapp://callback');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.token, 'fake_access_token');
    assert.strictEqual(result.user.id, 'user_123');
    assert.strictEqual(result.user.name, 'John');
    assert.strictEqual(result.user.surname, 'Doe');
    
    console.log('Test passed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    axios.post = originalPost;
    axios.get = originalGet;
  }
}

runTests();
