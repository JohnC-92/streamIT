const {query, transaction, commit, rollback} = require('../../utils/mysqlcon');

const makePayment = async (from_id, to_id, message, amount) => {
  try {
    await transaction();
    paymentObj = {
      from_id: '',
      from_name: '',
      to_id: '',
      to_name: '',
      amount: '',
      message: '',
    };
    const result = await query('INSERT INTO payment SET ?', [paymentObj]);
    await commit();
    return result;
  } catch (err) {
    await rollback();
    return {error: err};
  }
};

module.exports = {
  makePayment,
};
