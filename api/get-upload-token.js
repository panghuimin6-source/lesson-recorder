const qiniu = require('qiniu');

module.exports = (req, res) => {
  try {
    const accessKey = process.env.QINIU_ACCESS_KEY;
    const secretKey = process.env.QINIU_SECRET_KEY;
    const bucket = process.env.QINIU_BUCKET;

    if (!accessKey || !secretKey || !bucket) {
      return res.status(500).json({ error: '环境变量未配置正确' });
    }

    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
      scope: bucket,
      expires: 3600  // token 有效期 1 小时
    };

    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    res.status(200).json({ token: uploadToken });
  } catch (err) {
    console.error('生成上传 token 出错：', err);
    res.status(500).json({ error: '生成上传 token 失败' });
  }
};
