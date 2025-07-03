import React, { useRef, useEffect, useState } from 'react';

const RippleCanvas = ({playNote}) => {
  // size of canvas
  const width = 300;
  const height = 200;
  // used for calculating how ripples dissipate
  const goldenRatio = 1.618;
  const rainIntervalMax = 1500;
  const rainIntervalMin = 100;
  const rainIntervalDisplayDefault = 200;

  // ---------- ref objects ------------
  const canvasRef = useRef(null);
  // this holds the current set of circles in a mutable variable 
  // allows us to animate without rerendering the component on every frame when circles updates.
  const circlesRef = useRef([]); 
  // this holds the most recent animation frame's ID returned on each request
  // when the component unmounts we can call cancelAnimationFrame at the end of useEffect 
  // that way it doesn't continue trying to animate after the component is gone.
  const requestRef = useRef();
  const intervalRef = useRef();

  // ---------- rippleSettings state ------------
  // rippleSpeed: 
  //   amount each circle's radius grows per animation frame.
  // decay: 
  //   circle's transparency is multiplied by the decay on each animation frame.
  //   when each circle's transparency gets below the threshold it is removed from the array and no longer drawn.
  const [rippleSettings, setRippleSettings] = useState({
    rippleSpeed: 25,
    decay: 5,
    rainSpeed: (rainIntervalDisplayDefault * -1) + rainIntervalMin + rainIntervalMax,
    displayRainSpeed: rainIntervalDisplayDefault,
    isRaining: false
  })

  // ---------- ripple constants that do not need sliders ------------
  // transparencyThreshold
  //   when each circle is drawn it gets some echoes drawn with it which are smaller circles that are more transparent.
  // numberOfEchoes:
  //   each echo's size and transparency is calculated with the golden ratio in relation to the current circle.
  const transparencyThreshold = 0.04;
  const numberOfEchoes = 10;

  const drawRipples = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    circlesRef.current.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 150, 255, ${circle.transparency})`;
      ctx.stroke();

      // add other circles for echos 
      let echoRadius = circle.radius;
      let echoTransparency = circle.transparency;
      for (var i = 0; i < numberOfEchoes; i++) {
        echoRadius = echoRadius / goldenRatio;
        echoTransparency = echoTransparency / goldenRatio;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, echoRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 150, 255, ${echoTransparency})`;
        ctx.stroke();
      }
    });
  };

  const updateCircles = () => {
    circlesRef.current = circlesRef.current
      .map((circle) => {
        if (circle.transparency > transparencyThreshold) {
          return { ...circle, 
            radius: circle.radius + 0.04 + rippleSettings.rippleSpeed / 100, 
            transparency: circle.transparency * (rippleSettings.decay * 0.0032 + 0.98)
          };
        } else {
          return null; // remove this circle when it gets more transparent than the threshold.
        }
      })
      .filter(Boolean); // remove nulls
  };

  useEffect(() => {
    // Start animation loop once on render then continue it in the background
    if(rippleSettings.isRaining){
      requestRef.current = requestAnimationFrame(animate);
      intervalRef.current = setInterval(() => {
        createRipple();
        playNote(rippleSettings);
      }, (rippleSettings.rainSpeed));
    }
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(requestRef.current);
    }
  }, [rippleSettings]);

  const animate = () => {
    // each animation frame we update the collection of circles so that they get bigger and more transparent
    updateCircles();
    // then we draw the current state of the circles
    drawRipples();
    // then the next frame of animation repeats this process calling itself recursively
    requestRef.current = requestAnimationFrame(animate);
  };

  const createRipple = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);
    circlesRef.current.push({ x, y, radius: 1.0, transparency: 1.0 });
  };

  const changeRippleSettings = (e) => {
    let {value, id} = e.target;
    setRippleSettings({...rippleSettings, [id]: value})
  }

  const calculateRainSpeed = (e) => {
    let {value, min, max} = e.target;
    let invertedValue = (value * -1) + rainIntervalMin + rainIntervalMax;
    setRippleSettings({...rippleSettings, rainSpeed: invertedValue, displayRainSpeed: value})
  }

  const startRain = () => {
    setRippleSettings({...rippleSettings, isRaining: true})
    // Start animation loop once on render then continue it in the background
    requestRef.current = requestAnimationFrame(animate);
    intervalRef.current = setInterval(() => {
      createRipple();
      playNote(rippleSettings);
    }, (rippleSettings.rainSpeed));
  }

  const stopRain = () => {
    clearInterval(intervalRef.current);
    cancelAnimationFrame(requestRef.current);
  }

  return (
    <div>
      <div>
        <button onClick={startRain}>Start</button>
        <button onClick={stopRain}>Stop</button>
      </div>
      <canvas ref={canvasRef} width={width} height={height} style={{ border: '1px solid black' }} />
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

export default RippleCanvas;
