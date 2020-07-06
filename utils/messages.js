const moment = require('moment');

/**
 * Function to return user text with sent time
 * @param {*} username
 * @param {*} text
 * @return {*} Message Obj with sent time
 */
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
  };
}

module.exports = formatMessage;
