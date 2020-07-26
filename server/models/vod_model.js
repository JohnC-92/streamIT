const {query} = require('../../utils/mysqlcon');

const getUserVOD = async (streamKey) => {
  try {
    const vods = await query('SELECT * FROM videos WHERE stream_key = ?', [streamKey]);
    return vods;
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  getUserVOD,
}