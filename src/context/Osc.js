import { scaleValue } from '../utils/mathHelpers';
import * as CONFIG from '../utils/constants';

export class Osc {

  static LOWEST_FREQUENCY = 55;

  constructor(actx, connection, baseOctave, rippleSettings, circles) {
    this.actx = actx;
    this.calculateEnvelope(rippleSettings);
    this.osc = actx.createOscillator();
    this.osc.frequency.value = this.calculateFrequency(rippleSettings, circles, baseOctave);
    // slight detune between -.1 and +.1
    this.osc.detune.value = (Math.random() / 10) - .05;
    this.osc.type = 'sawtooth';
    this.gateGain = actx.createGain();
    this.gateGain.gain.value = 0;
    this.osc.connect(this.gateGain);
    this.gateGain.connect(connection);
    this.easing = 0.1;
    this.osc.start();
    this.start();
  }
  calculateFrequency(rippleSettings, circles, baseOctave){
    // use circle coordinates to define pitch: x correspond to interval and y to octave
    const currentCircle = circles[circles.length - 1];
    const x = currentCircle.x;
    const y = currentCircle.y;
    // unison, octave, fifth, fourth, third, sixth, maj second. 
    // duplicates to weight certain notes.
    // octaves range from down an octave (.5) same octave (1) to up an octave (2)
    let intervalsMajor = [1, 2, 3/2, 4/3, 5/4, 5/3, 9/8, 4/3, 3/2, 1, 2, 3/2]
    intervalsMajor = intervalsMajor.sort(function(a,b) { return a - b;});
    const octaveMultiplierList = [0.5, 1, 2];
    const widthInterval = CONFIG.CANVAS_WIDTH / intervalsMajor.length;
    const heightInterval = CONFIG.CANVAS_HEIGHT / octaveMultiplierList.length;
    // scale x and y to map to the arrays of intervals and octave multipliers. Then get the value out of the array.
    const widthIndex = Math.floor(scaleValue(x, 0, (CONFIG.CANVAS_WIDTH - widthInterval), 0, (intervalsMajor.length - 1), true));
    const interval = intervalsMajor[widthIndex];
    // inverse so that 0 on canvas height (top of canvas) is the largest index in the array.
    // round up this time and we need the .abs just because for 0 javascript gives us -0 (lol)
    const heightIndex = Math.abs(Math.ceil(scaleValue(y, 0, (CONFIG.CANVAS_HEIGHT - heightInterval), (octaveMultiplierList.length - 1), 0, false)));
    const octaveMultiplier = octaveMultiplierList[heightIndex];
    
    // lastly, calculate keyFreq from a default lowest frequency putting us in the key of A.
    const keyFreq = Osc.LOWEST_FREQUENCY + (Osc.LOWEST_FREQUENCY * baseOctave);
    let finalFrequency = keyFreq * interval * octaveMultiplier;
    return finalFrequency;
  }
  calculateEnvelope(rippleSettings){
    this.attack = 0.1;
    this.release = this.calculateRelease(rippleSettings);
    this.sustain = this.calculateSustain(rippleSettings);
  }
  calculateRelease(rippleSettings){
    // time values in seconds.
    // rippleSettings.decay goes from 0 -> 10 (sustain slider)
    const rippleSettingsDecayMin = 0;
    const rippleSettingsDecayMax = 10;
    const releaseMin = .2;
    const releaseMax = 5.2;
    const release = scaleValue(rippleSettings.decay, rippleSettingsDecayMin, rippleSettingsDecayMax, releaseMin, releaseMax);
    return release;
  }
  calculateSustain(rippleSettings){
    // sustain is the loudness of each note while it rings out. 
    // the longer the release, the more notes at once. 
    // also the more rain the more notes at once. 
    // so both of these should make the sustain quieter. 
    // start with .6 as the base value. 
    // release is going to be between 0.2 and 5.2, displayRainSpeed is 100 - 1500 
    const displayRainSpeedMin = 100;
    const displayRainSpeedMax = 1500;
    const releaseMin = 0.2;
    const releaseMax = 5.2;
    // turn both into a float from 0 to 1
    // when these are at 0 we want the max sustain of 0.6.
    // when they are at 1 we probably want something like 0.05
    const maxSustain = 0.5;
    const minSustain = 0.08;
    // so multiply them! if release and rain are both at 1 we get 1.
    // if they are both at 0 we get 0. if release is at 1 and rain is .5 we get .5 
    // but we want almost 0 for min values because otherwise if one slider is at min then scaler is always 0. 
    // we want other slider to still change the scaler value.
    const howMuchRain = scaleValue(parseInt(rippleSettings.displayRainSpeed), displayRainSpeedMin, displayRainSpeedMax, 0.01, 1);
    const howMuchRelease = scaleValue(this.release, releaseMin, releaseMax, 0.01, 1);
    const scaler = howMuchRain * howMuchRelease;
    // when scaler is at max 1 we want smallest sustain value 0.08 and when x is at min we want 0.6
    let sustain = scaleValue(scaler, 0, 1, maxSustain, minSustain);
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
