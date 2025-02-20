export default class AudioWaveform {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioData = [];
    this.isRecording = false;
    this.analyser = null;
    this.dataArray = null;
  }

  async startRecording() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      // 设置音频分析器
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isRecording = true;

      // 开始录制
      this.mediaRecorder.start();
      this.mediaRecorder.ondataavailable = (e) => {
        this.audioData.push(e.data);
      };

      // 开始绘制波形
      this.drawWaveform();
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  drawWaveform() {
    const draw = () => {
      if (!this.isRecording) return;

      // 清除画布
      this.ctx.fillStyle = 'rgb(200, 200, 200)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // 获取音频数据
      this.analyser.getByteTimeDomainData(this.dataArray);

      // 设置波形样式
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'rgb(0, 0, 0)';
      this.ctx.beginPath();

      const sliceWidth = this.canvas.width * 1.0 / this.dataArray.length;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        const v = this.dataArray[i] / 128.0;
        const y = v * this.canvas.height / 2;
   
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
      this.ctx.stroke();

      requestAnimationFrame(draw);
    };

    draw();
  }

  getAudioBlob() {
    return new Blob(this.audioData, { type: 'audio/webm' });
  }
}