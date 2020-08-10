const VOD = require('../models/vod_model');

// get all user VODs with user stream key
const getUserVODs = async (req, res) => {
  const {streamKey} = req.params;

  const vods = await VOD.getUserVODs(streamKey);
  if (vods.error) {
    return res.send({error: vods.error});
  }

  res.send(vods);
};

// get single user VOD with video id
const getUserVOD = async (req, res) => {
  const {id} = req.params;

  const vods = await VOD.getUserVOD(id);
  if (vods.error) {
    return res.send({error: vods.error});
  }

  res.send(vods);
};

module.exports = {
  getUserVODs,
  getUserVOD,
}