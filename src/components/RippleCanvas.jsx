import React, { useRef, useEffect, useState } from 'react';
import { scaleValue } from '../utils/mathHelpers';
import * as CONFIG from '../utils/constants';

export function RippleCanvas({playNote, onRippleSpeedChange, filterSettings, synthSettings}){
  // used for calculating how ripples dissipate
  const goldenRatio = 1.618;
  const rainIntervalMax = 1500;
  const rainIntervalMin = 100;
  const rainIntervalDisplayDefault = 300;

  // ---------- rippleSettings state ------------
  // rippleSpeed: 
  //   amount each circle's radius grows per animation frame.
  // decay: 
  //   circle's transparency is multiplied by the decay on each animation frame.
  //   when each circle's transparency gets below the threshold it is removed from the array and no longer drawn.
  // rainSpeed:
  //   milliseconds between raindrops (setInterval). each raindrop also triggers a new note with playNote.
  // displayRainSpeed: 
  //   used for the slider controlling amount of rain because it is an inverse display. highest slider value = fastest rain.
  // isRaining:
  //   starts false and is set to true by start button, back to false with stop button. Web audio api requires user gesture.
  // hue: 
  //   color of ripples, governed by frequency of filter in the filter component..
  // lightness:
  //   lightness of the color of ripples (hsla) governed by the Q of the filter.
  const [rippleSettings, setRippleSettings] = useState({
    rippleSpeed: 25,
    decay: 5,
    rainSpeed: scaleValue(rainIntervalDisplayDefault, rainIntervalMin, rainIntervalMax, rainIntervalMax, rainIntervalMin),
    displayRainSpeed: rainIntervalDisplayDefault,
    isRaining: false,
    hue: filterSettings.frequency / 5,
    lightness: filterSettings.Q * 20 + 20
  })
  // ---------- ref objects ------------

  // need ref of rippleSettings and synthSettings for up to date values in setInterval and requestAnimationFrame
  const rippleSettingsRef = useRef(rippleSettings);
  const synthSettingsRef = useRef(synthSettings);
  // holds actual canvas object. don't want to rerender it. 
  const canvasRef = useRef(null);
  // this holds the current set of circles in a mutable variable 
  // allows us to animate without rerendering the component on every frame when circles updates.
  const circlesRef = useRef([]); 
  // requestRef holds the most recent animation frame's ID returned on each request
  // when the component unmounts we can call cancelAnimationFrame at the end of useEffect 
  // that way it doesn't continue trying to animate after the component is gone.
  // similarly intervalRef holds the returned value from setInterval so that it can be cancelled and restarted with a new speed when rainSpeed changes.
  const requestRef = useRef();
  const intervalRef = useRef();

  // ---------- ripple constants that do not need sliders ------------
  // transparencyThreshold
  //   when each circle is drawn it gets some echoes drawn with it which are smaller circles that are more transparent.
  // numberOfEchoes:
  //   each echo's size and transparency is calculated with the golden ratio in relation to the current circle.
  const transparencyThreshold = 0.04;
  const numberOfEchoes = 10;

  // need these two useEffects to update state when audio settings change.
  // synthSettings and filterSettings are coming from the separate synth and filter components.
  // Each ripple created in RippleCanvas triggers a note, so we have to pass it the most up to date version of synth settings.
  // and the filter settings control the colors of the ripples 
  // so we need to update the rippleSettings state when filterSettings changes, which also causes the RippleCanvas to re-render.
  useEffect(() => {
    synthSettingsRef.current = synthSettings;
  }, [synthSettings]);

  useEffect(() => {
    rippleSettingsRef.current = rippleSettings;
  }, [rippleSettings]);

  useEffect(() => {
    const { frequency, Q } = filterSettings;
    const freqToHue = scaleValue(frequency, 0, 1000, 0, 360);
    const qToLightness = scaleValue(Q, 0, 3, 40, 100);

    setRippleSettings(prev => ({
      ...prev,
      hue: freqToHue,
      lightness: qToLightness
    }));
  }, [filterSettings.frequency, filterSettings.Q]);

  // animation loop functions. Every animation frame we draw ripples and then update the collection of circles.
  const drawRipples = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    circlesRef.current.forEach((circle) => {
      drawCircle(ctx, circle.x, circle.y, circle.radius, rippleSettingsRef.current.hue, rippleSettingsRef.current.lightness, circle.transparency);

      // add other circles for echos 
      let echoRadius = circle.radius;
      let echoTransparency = circle.transparency;
      for (var i = 0; i < numberOfEchoes; i++) {
        echoRadius = echoRadius / goldenRatio;
        echoTransparency = echoTransparency / goldenRatio;
        drawCircle(ctx, circle.x, circle.y, echoRadius, rippleSettingsRef.current.hue, rippleSettingsRef.current.lightness, echoTransparency);
      }
    });
  };

  // draw a single circle. utility used by drawRipples.
  const drawCircle = (ctx, x, y, radius, hue, lightness, transparency) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    let strokeStyle = `hsla(${hue}, ${lightness}%, 50%, ${transparency})`
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }

  // updates the set of circles making them grow larger and more transparent on each frame
  // has to use a ref for the array of circles because it needs to be updated at the animation speed of 60fps.
  // we don't want to use a state variable for the circles because that would cause the component to re-render every frame.
  // also bad practice to update a state variable in a useEffect loop with itself in the dependency array. nearly infinite loop.
  const updateCircles = () => {
    circlesRef.current = circlesRef.current
      .map((circle) => {
        if (circle.transparency > transparencyThreshold) {
          return { ...circle, 
            radius: circle.radius + 0.04 + rippleSettingsRef.current.rippleSpeed / 100, 
            transparency: circle.transparency * (rippleSettingsRef.current.decay * 0.0032 + 0.98)
          };
        } else {
          return null; // remove this circle when it gets more transparent than the threshold.
        }
      })
      .filter(Boolean); // remove nulls
  };

  // animation loop triggered initiated by both start button and useEffect (if start button has been pressed before render) 
  const animate = () => {
    // each animation frame we update the collection of circles so that they get bigger and more transparent
    updateCircles();
    // then we draw the current state of the circles
    drawRipples();
    // then the next frame of animation repeats this process calling itself recursively
    requestRef.current = requestAnimationFrame(animate);
  };

  // Start animation loop on render if the start button has been pressed, 
  // then continue it in the background
  useEffect(() => {
    if(rippleSettings.isRaining){
      requestRef.current = requestAnimationFrame(animate);
      intervalRef.current = setInterval(() => {
        createRipple();
        playNote(rippleSettingsRef.current, circlesRef, synthSettingsRef);
      }, (rippleSettingsRef.current.rainSpeed));
    }
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(requestRef.current);
    }
  }, [rippleSettings.isRaining, rippleSettings.rainSpeed]);

  // ripples are created on an interval that is started at the same time as animation initiated.
  // timing of interval is set with rippleSettings.rainSpeed
  // every time a ripple is created a note is played.
  const createRipple = () => {
    const x = Math.floor(Math.random() * CONFIG.CANVAS_WIDTH);
    const y = Math.floor(Math.random() * CONFIG.CANVAS_HEIGHT);
    circlesRef.current.push({ x, y, radius: 1.0, transparency: 1.0 });
  };

  // ---------- Functions Triggered By UI ------------
  // want to be able to start an stop both animation and sound with a user gesture (required by web audio api)
  const startRain = () => {
    setRippleSettings(prev => ({ ...prev, isRaining: true }));
    requestRef.current = requestAnimationFrame(animate);
    intervalRef.current = setInterval(() => {
      createRipple();
      playNote(rippleSettingsRef.current, circlesRef, synthSettingsRef);
    }, (rippleSettings.rainSpeed));
  }

  const stopRain = () => {
    clearInterval(intervalRef.current);
    cancelAnimationFrame(requestRef.current);
  }

  // triggered by moving the rain speed slider.
  const calculateRainSpeed = (e) => {
    let {value} = e.target;
    let invertedValue = scaleValue(value, rainIntervalMin, rainIntervalMax, rainIntervalMax, rainIntervalMin);
    setRippleSettings(prev => ({ ...prev, rainSpeed: invertedValue, displayRainSpeed: value }));
  }

  // triggered by moving any other component sliders
  const changeRippleSettings = (e) => {
    let { value, id } = e.target;
    const numericValue = parseFloat(value);
    setRippleSettings(prev => ({ ...prev, [id]: numericValue }));

    if (id === 'rippleSpeed' && onRippleSpeedChange) {
      onRippleSpeedChange(numericValue); // notify parent to change reverb amount
    }
  };

  return (
    <div>
      <div className="master-controls">
        <button onClick={startRain}>Start</button>
        <button onClick={stopRain}>Stop</button>
      </div>
      <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} style={{ border: '1px solid black' }} />
      <div>
        <label htmlFor="rippleSpeed">Speed</label>
        <input 
          type="range" 
          id="rippleSpeed" 
          name="rippleSpeed" 
          max="100"
          step="0.01"
          value={rippleSettings.rippleSpeed}
          onChange={changeRippleSettings}>
        </input>
      </div>
      <div>
        <label htmlFor="decay">Sustain</label>
        <input 
          type="range" 
          id="decay" 
          name="decay" 
          max="10"
          step="0.01"
          value={rippleSettings.decay}
          onChange={changeRippleSettings}>
        </input>
      </div>
      <div>
        <label htmlFor="rainSpeed">Amount of Rain</label>
        <input 
          type="range" 
          id="rainSpeed" 
          name="rainSpeed"
          min={rainIntervalMin}
          max={rainIntervalMax}
          step="20"
          value={rippleSettings.displayRainSpeed}
          onChange={calculateRainSpeed}>
        </input>
      </div>
    </div>
  );
};
