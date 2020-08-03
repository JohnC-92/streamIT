const {query, transaction, commit, rollback} = require('../../utils/mysqlcon');

const updatePayment = async (from_id, from_name, to_id, to_name, amount, message) => {
  try {
    paymentObj = {
      from_id: from_id,
      from_name: from_name,
      to_id: to_id,
      to_name: to_name,
      amount: amount,
      message: message,
      time_created: new Date(),
    };
    const result = await query('INSERT INTO payment SET ?', [paymentObj]);   
    return result;
  } catch (err) {
    console.log(err)
    return {error: err};
  }
};

const getPayment = async (id, from) => {
  try {
    if (from === true) {
      const result = await query('SELECT * FROM payment WHERE from_id = ?', [id])
      return result;
    } else {
      const result = await query('SELECT * FROM payment WHERE to_id = ?', [id])
      return result;
    }
  } catch (err) {
    return {error: err};
  }
}

module.exports = {
  updatePayment,
  getPayment,
};
