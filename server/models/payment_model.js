const {query} = require('../../utils/mysqlcon');

const updatePayment = async (fromId, fromName, toId, toName, amount, message) => {
  try {
    paymentObj = {
      from_id: fromId,
      from_name: fromName,
      to_id: toId,
      to_name: toName,
      amount: amount,
      message: message,
      time_created: new Date(),
    };
    const result = await query('INSERT INTO payment SET ?', [paymentObj]);
    return result;
  } catch (err) {
    console.log(err);
    return {error: err};
  }
};

const getPayment = async (id, from) => {
  try {
    if (from === true) {
      const result = await query('SELECT * FROM payment WHERE from_id = ?', [id]);
      return result;
    } else {
      const result = await query('SELECT * FROM payment WHERE to_id = ?', [id]);
      return result;
    }
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  updatePayment,
  getPayment,
};
