const VOD = require('../models/vod_model');

const getUserVOD = async (req, res) => {
  const {streamKey} = req.params;
  // const {streamKey} = req.params;
  // console.log(streamKey);

  const vods = await VOD.getUserVOD(streamKey);
  if (vods.error) {
    return res.send({error: vods.error});
  }

  res.send(vods);
};

const getUserOneVOD = async (req, res) => {
  const {id} = req.params;
  // const {streamKey} = req.params;
  // console.log(streamKey);

  const vods = await VOD.getUserOneVOD(id);
  if (vods.error) {
    return res.send({error: vods.error});
  }

  res.send(vods);
};

module.exports = {
  getUserVOD,
  getUserOneVOD,
}