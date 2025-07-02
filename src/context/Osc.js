export default class Osc {
  constructor(actx, connection, frequency, sustain) {
    this.actx = actx;
    this.envelope = {
      attack: 0.1,
      decay: 0.1,
      sustain: sustain || 0.6,
      release: 1,
    };
    this.osc = actx.createOscillator();
    this.key = frequency;
    this.osc.frequency.value = this.calculateFrequency();
    this.osc.detune.value = 0;
    this.osc.type = 'sawtooth';
    this.gateGain = actx.createGain();
    this.gateGain.gain.value = 0;
    this.osc.connect(this.gateGain);
    this.gateGain.connect(connection);
    this.easing = 0.1;
    this.osc.start();
    this.start();
  }
  calculateFrequency(){
    // unison, octave, fifth, fourth, third, sixth, maj second. 
    // duplicates at end for to weight certain notes.
    const intervalsMajor = [1, 2, 3/2, 4/3, 5/4, 5/3, 9/8, 4/3, 3/2, 1, 2, 3/2];
    const octaveMultiplierList = [0.5, 1, 2];
    const intervalIndex = Math.floor(Math.random() * intervalsMajor.length);
    const octaveIndex = Math.floor(Math.random() * octaveMultiplierList.length);
    const interval = intervalsMajor[intervalIndex];
    const octaveMultiplier = octaveMultiplierList[octaveIndex];
    let finalFrequency = this.key * interval * octaveMultiplier;
    console.log('key ' + this.key + ' final frequency ' + finalFrequency);
    return finalFrequency;
  }
  start(){
    let {currentTime} = this.actx;
    this.gateGain.gain.cancelScheduledValues(currentTime);
    let startEnvelopeTime = currentTime + this.easing;
    this.gateGain.gain.setValueAtTime(0, startEnvelopeTime);
    let attackToSustainLevelTime = startEnvelopeTime + this.envelope.attack + this.easing;
    this.gateGain.gain.linearRampToValueAtTime(this.envelope.sustain, attackToSustainLevelTime);
    let releaseTo0Time = attackToSustainLevelTime + this.envelope.release + this.easing;
    this.gateGain.gain.linearRampToValueAtTime(0, releaseTo0Time);
    let disconnectTime = releaseTo0Time + this.easing;
    setTimeout(()=>{    
      this.osc.disconnect();
    }, 2000);
  }
}
