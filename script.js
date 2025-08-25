let audioBlob = null;

document.getElementById('startButton').onclick = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      document.getElementById('stopButton').disabled = false;
      document.getElementById('startButton').disabled = true;

      mediaRecorder.ondataavailable = event => {
        audioBlob = event.data;
        document.getElementById('player').src = URL.createObjectURL(audioBlob);
      };

      document.getElementById('stopButton').onclick = () => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        document.getElementById('uploadButton').disabled = false;
        document.getElementById('stopButton').disabled = true;
      };
    })
    .catch(err => alert("请允许麦克风权限！"));
};

document.getElementById('uploadButton').onclick = () => {
  if (!audioBlob) return alert("请先录音！");

  fetch('/api/get-upload-token')
    .then(res => res.json())
    .then(data => {
      const uploadToken = data.token;
      const formData = new FormData();
      formData.append('file', audioBlob);

      formData.append('token', uploadToken);

      // 华东节点上传
      fetch('https://upload.qiniup.com', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(uploadRes => {
        if (uploadRes.key) {
          // 临时用七牛默认 CDN 测试
          const fileUrl = `http://${process.env.QINIU_BUCKET}.qiniucdn.com/${uploadRes.key}`;
          alert("上传成功！");
          console.log("✅ 上传成功：", fileUrl);
        } else {
          alert("上传失败！");
          console.log(uploadRes);
        }
      })
      .catch(err => {
        console.error("上传失败：", err);
        alert("上传出错！");
      });
    });
};
