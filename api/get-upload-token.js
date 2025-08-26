import formidable from 'formidable';
import qiniu from 'qiniu';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: '只允许 POST 请求' });

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: '解析文件失败' });

      const file = files.file;
      if (!file) return res.status(400).json({ error: '没有上传文件' });

      // 七牛配置
      const accessKey = process.env.QINIU_ACCESS_KEY;
      const secretKey = process.env.QINIU_SECRET_KEY;
      const bucket = process.env.QINIU_BUCKET;

      const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
      const options = { scope: bucket };
      const putPolicy = new qiniu.rs.PutPolicy(options);
      const uploadToken = putPolicy.uploadToken(mac);

      const config = new qiniu.conf.Config();
      config.zone = qiniu.zone.Zone_z1; // 华东浙江

      const formUploader = new qiniu.form_up.FormUploader(config);
      const putExtra = new qiniu.form_up.PutExtra();
      const key = `record-${Date.now()}.mp3`;

      formUploader.putFile(uploadToken, key, file.filepath, putExtra, function(respErr, respBody) {
        if (respErr) return res.status(500).json({ error: respErr.message });
        if (respBody && respBody.key) {
          const fileUrl = `http://t1i0t9lk0.hd-bkt.clouddn.com/${respBody.key}`;
          return res.status(200).json({ url: fileUrl });
        } else {
          return res.status(500).json({ error: '上传失败，七牛返回异常' });
        }
      });
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
