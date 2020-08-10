const {closeConnection} = require('./fake_data_generator');
const {requester} = require('./set_up');

after(async () => {
  await closeConnection();
  requester.close();
});
