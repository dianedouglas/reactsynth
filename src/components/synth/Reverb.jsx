import { useEffect, useRef, useState } from 'react';

function createReverbBuffer(audioCtx, reverse = false) {
  const sampleRate = audioCtx.sampleRate;
  const decay = 4.5;
  const length = sampleRate * decay;
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
  }
  return impulse;
}

const ReverbControls = ({ audioCtx, inputNode, outputNode }) => {
  const [wetMix, setWetMix] = useState(0.5);

  const convolverRef = useRef(null);
  const wetGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const outputGainRef = useRef(null);

  useEffect(() => {
    if (!audioCtx || !inputNode || !outputNode) return;

    const convolver = audioCtx.createConvolver();
    convolver.buffer = createReverbBuffer(audioCtx);

    const wetGain = audioCtx.createGain();
    const dryGain = audioCtx.createGain();
    const outputGain = audioCtx.createGain();

    wetGain.gain.value = wetMix;
    dryGain.gain.value = 1 - wetMix;
    outputGain.gain.value = 1 - wetMix * 0.1;

    convolverRef.current = convolver;
    wetGainRef.current = wetGain;
    dryGainRef.current = dryGain;
    outputGainRef.current = outputGain;

    // Connect nodes
    inputNode.connect(dryGain);
    dryGain.connect(outputGain);

    inputNode.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(outputGain);

    outputGain.connect(outputNode);

    return () => {
      inputNode.disconnect();
      convolver.disconnect();
      wetGain.disconnect();
      dryGain.disconnect();
      outputGain.disconnect();
    };
  }, [audioCtx, inputNode, outputNode]);

  // Smoothly update gains on wetMix change
  useEffect(() => {
    if (
      wetGainRef.current &&
      dryGainRef.current &&
      outputGainRef.current &&
      audioCtx
    ) {
      const now = audioCtx.currentTime;
      const rampTime = 0.05; // 50ms ramp

      wetGainRef.current.gain.cancelScheduledValues(now);
      wetGainRef.current.gain.setTargetAtTime(wetMix, now, 0.05);

      dryGainRef.current.gain.cancelScheduledValues(now);
      dryGainRef.current.gain.linearRampToValueAtTime(1 - wetMix, now + rampTime);

      const adjustedOutput = 1 - wetMix * 0.1;
      outputGainRef.current.gain.cancelScheduledValues(now);
      outputGainRef.current.gain.linearRampToValueAtTime(adjustedOutput, now + rampTime);
    }
  }, [wetMix, audioCtx]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <label>
        Wet/Dry Mix: {(wetMix * 100).toFixed(0)}%
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={wetMix}
          onChange={(e) => setWetMix(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
};

export default ReverbControls;
