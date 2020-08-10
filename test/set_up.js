const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {nodeEnv} = require('../utils/config');
const {truncateFakeData, createFakeData} = require('./fake_data_generator');

chai.use(chaiHttp);

const assert = chai.assert;
const requester = chai.request(app).keepOpen();

before(async () => {
  if (nodeEnv !== 'test') {
    throw 'Not in test env';
  }

  await truncateFakeData();
  await createFakeData();
});

module.exports = {
  assert,
  requester,
};
