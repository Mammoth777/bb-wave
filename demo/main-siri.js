import BBWave from '../src/BBWave.js';
// 原始代码逻辑
async function main() {
  // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const bbwave = new BBWave(document.getElementById('bbwave'));
  bbwave.start(stream);
}

main()