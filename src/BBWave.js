/**
 * 参考值，但不太准
 * 字节值  | dBFS   | SPL(dB) | 实际声音参照
 * 255    | -30    | 90      | 繁忙街道、工厂噪音
 * 224    | -38.75 | 81      | 城市交通噪音
 * 192    | -47.5  | 72      | 普通谈话声音（稍大）
 * 160    | -56.25 | 64      | 正常办公室环境
 * 128    | -65    | 55      | 安静的办公室
 * 96     | -73.75 | 46      | 安静的住宅区
 * 64     | -82.5  | 37      | 图书馆环境
 * 32     | -91.25 | 29      | 轻声耳语
 * 0      | -100   | 20      | 树叶沙沙声
 */
function normalize(value) {
  const r = value / 64;
  return r > 1 ? 1 : r;
}

export default class BBWave {
  #siriWave = null;
  #analyser = null;
  #dataArray = [];
  #bufferLength = 0;
  constructor(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) {
      throw new Error('container is required');
    }
    this.#siriWave = new SiriWave({
      container,
      width: 640,
      height: 200,
      speed: 0.11,
      autostart: true
    });
  }
  #getVolume() {
    this.#analyser.getByteFrequencyData(this.#dataArray);
    const bufferLength = this.#bufferLength;
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += this.#dataArray[i];
    }
    const average = sum / bufferLength;
    return average;
  }
  #updateVolume() {
    const volume = this.#getVolume();
    const normalizedVolume = normalize(volume);
    this.#siriWave.setAmplitude(normalizedVolume);
    requestAnimationFrame(this.#updateVolume.bind(this));
  }
  createAnalyser(stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = this.#analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = this.#bufferLength = analyser.frequencyBinCount;
    this.#dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    this.#updateVolume();
  }
  start(stream) {
    this.createAnalyser(stream);
    this.#siriWave.start();
  }
  stop() {
    this.#siriWave.stop();
  }
}
