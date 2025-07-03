export default class Osc {
  constructor(actx, connection, frequency, rippleSettings) {
    this.actx = actx;
    this.calculateEnvelope(rippleSettings);
    this.osc = actx.createOscillator();
    this.key = frequency;
    this.osc.frequency.value = this.calculateFrequency();
    // slight detune between -.1 and +.1
    this.osc.detune.value = (Math.random() / 5) - .1;
    this.osc.type = 'sawtooth';
    this.gateGain = actx.createGain();
    this.gateGain.gain.value = 0;
    this.osc.connect(this.gateGain);
    this.gateGain.connect(connection);
    this.easing = 0.1;
    // console.log(this.envelope.release);
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
    // console.log('key ' + this.key + ' final frequency ' + finalFrequency);
    return finalFrequency;
  }
  calculateEnvelope(rippleSettings){
    this.attack = 0.1;
    this.release = this.calculateRelease(rippleSettings);
    this.sustain = this.calculateSustain(rippleSettings);
  }
  calculateRelease(rippleSettings){
    // time values in seconds.
    // rippleSettings.decay goes from 0 -> 10
    let release = rippleSettings.decay / 2 + 0.2;
    // console.log(release);
    return release;
  }
  calculateSustain(rippleSettings){
    // sustain is the loudness of each note while it rings out. 
    // the longer the release, the more notes at once. 
    // also the more rain the more notes at once. 
    // so both of these should make the sustain quieter. 
    // start with .6 as the base value. 

    // release is going to be between 0.2 and 5.2
    // displayRainSpeed is 100 - 1500 
    // turn both into a float from 0 to 1
    let howMuchRain = (parseInt(rippleSettings.displayRainSpeed) - 100) / 1400; 
    let howMuchRelease = (this.release - 0.2) / 5;
    // when these are at 0 we want the max sustain of 0.6.
    // when they are at 1 we probably want something like 0.05
    // if I multiply them what do I get? if release and rain are both at 1 we get 1.
    // if they are both at 0 we get 0. if release is at 1 and rain is .5 we get .5 
    let scaler = howMuchRain * howMuchRelease;
    // calculate a linear equation ax + b = y 
    // where x is the scaler and y is the sustain value and y is a function of x
    // when x is at max 1 we want 0.05 and when x is at min 0 we want 0.6
    // a comes out to -0.55 and b comes out to 0.6. adjust to taste.
    let sustain = (scaler * -0.57) + 0.5;
    return sustain;
  }
  start(){
    let {currentTime} = this.actx;
    this.gateGain.gain.cancelScheduledValues(currentTime);
    let startEnvelopeTime = currentTime + this.easing;
    this.gateGain.gain.setValueAtTime(0, startEnvelopeTime);
    let attackToSustainLevelTime = startEnvelopeTime + this.attack + this.easing;
    this.gateGain.gain.linearRampToValueAtTime(this.sustain, attackToSustainLevelTime);
    let releaseTo0Time = attackToSustainLevelTime + this.release + this.easing;
    this.gateGain.gain.linearRampToValueAtTime(0, releaseTo0Time);
    let disconnectTime = releaseTo0Time + this.easing;
    setTimeout(()=>{    
      this.osc.disconnect();
    }, (this.release * 1000) + 1000);
  }
}
