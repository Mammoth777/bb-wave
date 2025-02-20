import AudioWaveform from './AudioWaveform.js';

// 创建 canvas 元素
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 200;
document.body.appendChild(canvas);

// 初始化 AudioWaveform
const waveform = new AudioWaveform(canvas);

// 开始录制
startButton.addEventListener('click', () => {
  waveform.startRecording();
});

// 停止录制
stopButton.addEventListener('click', () => {
  waveform.stopRecording();
  // 获取录制的音频数据
  const audioBlob = waveform.getAudioBlob();
});