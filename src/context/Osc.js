export default class Osc {
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
    // console.log(this.envelope.release);
    this.osc.start();
    this.start();
  }
  calculateFrequency(rippleSettings, circles, baseOctave){
    // unison, octave, fifth, fourth, third, sixth, maj second. 
    // duplicates to weight certain notes.
    let intervalsMajor = [1, 2, 3/2, 4/3, 5/4, 5/3, 9/8, 4/3, 3/2, 1, 2, 3/2]
    intervalsMajor = intervalsMajor.sort(function(a,b) { return a - b;});
    const octaveMultiplierList = [0.5, 1, 2];
    const currentCircle = circles[circles.length - 1];
    const canvasWidth = 300;
    const canvasHeight = 200;
    const widthInterval = canvasWidth / intervalsMajor.length;
    const heightInterval = canvasHeight / octaveMultiplierList.length;
    const x = currentCircle.x;
    const y = currentCircle.y;
    // x is 0-300 
    // let's make x correspond to interval and y to octave
    // x * xMultiplier + b = widthIndex
    // if x is 0 then we want widthIndex to be 0 
    // 0 + b = 0 so b = 0. 
    // if x is in the largest quadrant of the x axis canvasWidth / intervalsMajor.length 
    // if x is canvasWidth - widthInterval or greater then widthIndex = intervalsMajor.length - 1
    // (canvasWidth - widthInterval) * xMultiplier = intervalsMajor.length - 1
    const xMultiplier = (intervalsMajor.length - 1) / (canvasWidth - widthInterval);
    const widthIndex = Math.floor(x * xMultiplier);
    // same thing for Y but going to octaveMultiplierList and with canvasHeight and reversed.
    // y * yMultiplier + b = heightIndex
    // if y is in the top quadrant of the canvasHeight then we want heightIndex to be 0 cause that's the bottom of the canvas.
    //  (canvasHeight - heightInterval) * yMultiplier + b = 0
    // if y is 0 then we want the heightIndex to be the maximum index octaveMultiplierList.length - 1
    //  0 * yMultiplier + b = octaveMultiplierList.length - 1
    //  (canvasHeight - heightInterval) * yMultiplier = - b
    //  (canvasHeight - heightInterval) * yMultiplier = - b
    const b = octaveMultiplierList.length - 1;
    //  (canvasHeight - heightInterval) * yMultiplier = -1 * (octaveMultiplierList.length - 1)
    const yMultiplier = (-1 * (octaveMultiplierList.length - 1)) / (canvasHeight - heightInterval);
    // round up this time and we need the .abs just because for 0 javascript gives us -0 (lol)
    const heightIndex = Math.abs(Math.ceil((y * yMultiplier) + b));
    const interval = intervalsMajor[widthIndex];
    const octaveMultiplier = octaveMultiplierList[heightIndex];
    // lastly, calculate keyFreq from a default lowest frequency.
    const LOWEST_FREQUENCY = 55;
    let keyFreq = LOWEST_FREQUENCY + (LOWEST_FREQUENCY * baseOctave);
    // console.log(keyFreq);
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
