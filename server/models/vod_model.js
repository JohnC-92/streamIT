const {query} = require('../../utils/mysqlcon');

const getUserVOD = async (streamKey) => {
  try {
    const vods = await query('SELECT * FROM videos WHERE stream_key = ?', [streamKey]);
    return vods;
  } catch (err) {
    return {error: err};
  }
};

const getUserOneVOD = async (id) => {
  try {
    const vods = await query('SELECT * FROM videos WHERE id = ?', [id]);
    return vods;
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  getUserVOD,
  getUserOneVOD,
}