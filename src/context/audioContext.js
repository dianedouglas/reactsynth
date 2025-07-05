const audioCtx = new AudioContext();
const gain = audioCtx.createGain();
const filter = audioCtx.createBiquadFilter();
gain.connect(filter);

export { audioCtx, gain, filter };
