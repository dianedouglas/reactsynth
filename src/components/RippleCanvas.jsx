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

  const width = 300;
  const height = 200;
  const maxRadius = Math.sqrt(width * width + height * height) / 6;
  const rippleSpeed = maxRadius / 1500;

  const drawRipples = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    circlesRef.current.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      let transparency = 1 - circle.radius / maxRadius;
      ctx.strokeStyle = `rgba(0, 150, 255, ${transparency})`;
      ctx.stroke();
    });
  };

  const updateCircles = () => {
    circlesRef.current = circlesRef.current
      .map((circle) => {
        if (circle.radius < maxRadius) {
          return { ...circle, radius: circle.radius + rippleSpeed };
        } else {
          return null; // remove this circle when it gets bigger than the maxRadius
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
    circlesRef.current.push({ x, y, radius: 1.0 });
  };

  return (
    <div>
      <button onClick={createRipple}>Create Ripple</button>
      <canvas ref={canvasRef} width={width} height={height} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default RippleCanvas;
