import React, { useRef, useEffect, useState } from 'react';

export function Canvas({props}){
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas element exists
    const render = () => {
      if(circles.length > 0){
        drawRipples()
        updateCircles()
      }
    }
    requestAnimationFrame(render)
  }, [circles]); // Empty dependency array ensures this runs once after initial render

  const createRipple = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas element exists
    let x = Math.floor(Math.random() * (canvas.width + 1));
    let y = Math.floor(Math.random() * (canvas.height + 1));
    setCircles((currentCircles) => {
      return [
        ...currentCircles,
        {
          x: x, 
          y: y,
          radius: 1.0
        }
      ]
    })
  }

  function updateCircles() {
    let width = 300;
    let height = 200;
    let maxRadius = Math.sqrt(width * width + height * height) / 6;
    let rippleSpeed = maxRadius / 1500;
    setCircles((currentCircles) => {
      return currentCircles.map(circle => {
        // increase circle radius on each update if less than max. 
        // otherwise remove from array.
        if(circle.radius < maxRadius){
          circle.radius += rippleSpeed;
          return circle
        }
      })
    })
  }


  function drawRipples() {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas element exists
    const context = canvas.getContext('2d'); 
    let width = canvas.width;
    let height = canvas.height;
    let maxRadius = Math.sqrt(width * width + height * height) / 6;
    let rippleSpeed = maxRadius / 1500;

    context.clearRect(0, 0, width, height);

    // paint each circle with its increased radius and transparency
    circles.map(circle => {
      context.beginPath();
      context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      let transparency = 1 - (circle.radius / maxRadius);
      console.log(transparency);
      context.strokeStyle = 'rgba(0, 150, 255, ' + transparency + ')';
      context.stroke();
    })
  }

  return (
    <div>
      <button onClick={createRipple}>add circle</button>
      <button onClick={() => drawRipples()}>draw ripples</button>
      <button onClick={() => updateCircles()}>updateCircles</button>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={200} 
        style={{ border: '1px solid black' }} 
      />
    </div>
  );
};
