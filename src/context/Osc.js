export default class Osc {
  constructor(actx, type, frequency, detune, envelope, connection) {
    this.actx = actx;
    this.envelope = envelope || {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.6,
      release: 1,
    };
    this.osc = actx.createOscillator();
    this.osc.frequency.value = frequency || 100;
    this.osc.detune.value = detune || 0;
    this.osc.type = type || 'sine';
    this.gateGain = actx.createGain();
    this.gateGain.gain.value = 0;
    this.osc.connect(this.gateGain);
    this.gateGain.connect(connection);
    this.easing = 0.1;
    this.osc.start();
    this.start();
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
