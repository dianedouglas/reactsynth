
import React, { useRef, useEffect, useState } from 'react';
import { scaleValue } from '../utils/mathHelpers';
import * as CONFIG from '../utils/constants';
import Button from '@mui/material/Button';

export function RippleCanvas({playNote, filterSettings, synthSettings, rippleSettings, setRippleSettings}){
  // used for calculating how ripples dissipate
  const goldenRatio = 1.618;
  const rainIntervalMax = 1500;
  const rainIntervalMin = 100;
  const rainIntervalDisplayDefault = 300;// ---------- ripple constants that do not need sliders ------------
  // transparencyThreshold
  //   when each circle is drawn it gets some echoes drawn with it which are smaller circles that are more transparent.
  // numberOfEchoes:
  //   each echo's size and transparency is calculated with the golden ratio in relation to the current circle.
  const transparencyThreshold = 0.04;
  const numberOfEchoes = 10;

  // ---------- ref objects ------------
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const intervalRef = useRef();
  const circlesRef = useRef([]); 
  const synthSettingsRef = useRef(synthSettings);
  const rippleSettingsRef = useRef(rippleSettings);
  const filterSettingsRef = useRef(filterSettings);

  useEffect(() => {
    synthSettingsRef.current = synthSettings;
  }, [synthSettings]);

  useEffect(() => {
    filterSettingsRef.current = filterSettings;
  }, [filterSettings]);

  // Start animation loop on render if the start button has been pressed, 
  // then continue it in the background
  useEffect(() => {
    rippleSettingsRef.current = rippleSettings;
    if(rippleSettingsRef.current.isRaining){
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
  }, [rippleSettings]);

  // animation loop functions. Every animation frame we draw ripples and then update the collection of circles.
  const drawRipples = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    let hue = scaleValue(filterSettingsRef.current.frequency, 0, 1000, 0, 360);
    let lightness = scaleValue(filterSettingsRef.current.Q, 0, 3, 40, 100);
    circlesRef.current.forEach((circle) => {
      drawCircle(ctx, circle.x, circle.y, circle.radius, hue, lightness, circle.transparency);

      // add other circles for echos 
      let echoRadius = circle.radius;
      let echoTransparency = circle.transparency;
      for (var i = 0; i < numberOfEchoes; i++) {
        echoRadius = echoRadius / goldenRatio;
        echoTransparency = echoTransparency / goldenRatio;
        drawCircle(ctx, circle.x, circle.y, echoRadius, hue, lightness, echoTransparency);
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
    setRippleSettings({...rippleSettingsRef.current, isRaining: true})
    requestRef.current = requestAnimationFrame(animate);
    intervalRef.current = setInterval(() => {
      createRipple();
      playNote(rippleSettingsRef.current, circlesRef, synthSettingsRef);
    }, (rippleSettingsRef.current.rainSpeed));
  }

  const stopRain = () => {
    clearInterval(intervalRef.current);
    cancelAnimationFrame(requestRef.current);
  }

  // triggered by moving the rain speed slider.
  const calculateRainSpeed = (e) => {
    let {value} = e.target;
    let invertedValue = scaleValue(value, rainIntervalMin, rainIntervalMax, rainIntervalMax, rainIntervalMin);
    setRippleSettings({...rippleSettingsRef.current, rainSpeed: invertedValue, displayRainSpeed: value})
  }

  // triggered by moving any other component sliders
  const changeRippleSettings = (e) => {
    let { value, id } = e.target;
    const numericValue = parseFloat(value);
    setRippleSettings({ ...rippleSettingsRef.current, [id]: numericValue });
  };

  return (
    <div>
      <div className="master-controls">
        <Button variant="contained" size="large" onClick={startRain}>Start</Button>
        <Button variant="contained" size="large" onClick={stopRain}>Stop</Button>
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
