export function scaleValue(inputValue, minInput, maxInput, minOutput, maxOutput) {
  // scale input to 0 -> 1.
  // say current value is 30 with input range of 0 - 100. 
  // (30 - 0) / 100 = .3 
  // if current value is 50 in a range of 20 - 120 
  // (50 - 20) / 100 = .3 as well. 
  // gives us a measurement of how high in the given range the input is scaled from 0 to 1.
  const rangeOfInputValues = maxInput - minInput;
  const scaledInput = (inputValue - minInput) / rangeOfInputValues;
  
  // This we can scale to output range
  // maxOutput - minOutput gives the desired range. Say 1000. 
  // if we multiply our scaledInput of .3 by that output range 1000 we get 300.
  // We add minOutput in case this needs to be offset by a different output value besides 0.
  return minOutput + scaledInput * (maxOutput - minOutput);
}
