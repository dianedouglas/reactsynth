export default class Osc {
  constructor(actx, type, frequency, detune, envelope, connection) {
    this.actx = actx;
    this.envelope = envelope || {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.618,
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
    this.easing = 0.005;
    this.osc.start();
    this.start();
  }
  start(){
    let {currentTime} = this.actx;
    this.gateGain.gain.cancelScheduledValues(currentTime);
    this.gateGain.gain.setValueAtTime(0, 
      currentTime + this.easing);
    // dont need decay we are making drones. just sustain level.
    // this.gateGain.gain.linearRampToValueAtTime(1, 
    //   currentTime + this.envelope.attack + this.easing);
    this.gateGain.gain.linearRampToValueAtTime(this.envelope.sustain, 
      currentTime + this.envelope.attack + this.envelope.decay + this.easing);

    // temporarily hardcoding sustain 
    this.gateGain.gain.linearRampToValueAtTime(0, 
      currentTime + this.envelope.attack + this.envelope.decay + this.envelope.release + this.easing);
    setTimeout(()=>{    
      this.osc.disconnect();
    }, 1100);
  }
  // stop(){
  //   let {currentTime} = this.actx;
  //   this.gateGain.gain.cancelScheduledValues(currentTime);
  //   this.gateGain.gain.setTargetAtTime(
  //     0,
  //     currentTime,
  //     this.envelope.release + this.easing
  //   )
  //   setTimeout(()=>{    
  //     this.osc.disconnect();
  //   }, 10000);
  // }
}
