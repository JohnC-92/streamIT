const {query} = require('../../utils/mysqlcon');

// get all user VODs with user stream key
const getUserVODs = async (streamKey) => {
  try {
    const vodsQuery = await query('SELECT * FROM videos WHERE stream_key = ?', [streamKey]);
    return vodsQuery;
  } catch (err) {
    return {error: err};
  }
};

// get single user VOD with video id
const getUserVOD = async (id) => {
  try {
    const vodQuery = await query('SELECT * FROM videos WHERE id = ?', [id]);
    return vodQuery;
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  getUserVODs,
  getUserVOD,
}