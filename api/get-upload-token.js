// api/get-upload-token.js
import qiniu from 'qiniu';

export default function handler(req, res) {
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;

  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const options = {
    scope: bucket,
    expires: 3600 // token 有效期 1 小时
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  res.status(200).json({ token: uploadToken });
}
