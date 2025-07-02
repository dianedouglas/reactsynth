import React, { useRef, useEffect, useState } from 'react';

const RippleCanvas = () => {
  const canvasRef = useRef(null);
  // this holds the current set of circles in a mutable variable 
  // allows us to animate without rerendering the component on every frame when circles updates.
  const circlesRef = useRef([]); 
  // this holds the most recent animation frame's ID returned on each request
  // when the component unmounts we can call cancelAnimationFrame at the end of useEffect 
  // that way it doesn't continue trying to animate after the component is gone.
  const requestRef = useRef();   
  // size of canvas
  const width = 300;
  const height = 200;
  // rippleSpeed is the amount each circle's radius grows per animation frame.
  const rippleSpeed = 0.16;
  // circle's transparency is multiplied by the speedOfTransparency on each animation frame.
  const speedOfTransparency = .996;
  // when each circle's transparency gets below the threshold it is removed from the array and no longer drawn.
  const transparencyThreshold = 0.04;
  // when each circle is drawn it gets some echoes drawn with it which are smaller circles that are more transparent.
  // each echo's size and transparency is calculated with the golden ratio in relation to the current circle.
  const numberOfEchoes = 10;
  const goldenRatio = 1.618;

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
          return { ...circle, radius: circle.radius + rippleSpeed, transparency: circle.transparency * speedOfTransparency };
        } else {
          return null; // remove this circle when it gets more transparent than the threshold.
        }
      })
      .filter(Boolean); // remove nulls
  };

  useEffect(() => {
    // Start animation loop once on render then continue it in the background
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

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

  return (
    <div>
      <button onClick={createRipple}>Create Ripple</button>
      <canvas ref={canvasRef} width={width} height={height} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default RippleCanvas;
