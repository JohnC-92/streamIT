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
    const paymentInsertQuery = await query('INSERT INTO payment SET ?', [paymentObj]);
    return paymentInsertQuery;
  } catch (err) {
    console.log(err);
    return {error: err};
  }
};

const getPayment = async (id, from) => {
  try {
    if (from === true) {
      const paymentFromQuery = await query('SELECT * FROM payment WHERE from_id = ?', [id]);
      return paymentFromQuery;
    } else {
      const paymentToQuery = await query('SELECT * FROM payment WHERE to_id = ?', [id]);
      return paymentToQuery;
    }
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  updatePayment,
  getPayment,
};
