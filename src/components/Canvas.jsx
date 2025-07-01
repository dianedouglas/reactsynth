import React, { useRef, useEffect, useState } from 'react';

export function Canvas({props}){
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas element exists
    const context = canvas.getContext('2d');

    // Drawing logic goes here
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height); // Draw a blue rectangle filling the canvas
  }, []); // Empty dependency array ensures this runs once after initial render

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
    animate();
  }

  function updateRipples() {
    console.log(circles[0]);
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas element exists
    const context = canvas.getContext('2d'); 
    let width = canvas.width;
    let height = canvas.height;
    // let maxRadius = Math.sqrt(width * width + height * height) / 2;
    let maxRadius = Math.sqrt(width * width + height * height) / 6;
    let rippleSpeed = maxRadius / 1500;
    // let rippleSpeed = maxRadius / 200;

    context.clearRect(0, 0, width, height);
    
    setCircles((currentCircles) => {
      return currentCircles.map(circle => {
        // increase circle radius on each update
        circle.radius += rippleSpeed;
        return circle
      })
    })

    // remove any circles that are over max width
    setCircles((currentCircles) => {
      return currentCircles.filter(circle => {return circle.radius < maxRadius})
    })

    // paint each circle with its increased radius and transparency
    for (let i = 0; i < circles.length; i++) {
      context.beginPath();
      context.arc(circles[i].x, circles[i].y, circles[i].radius, 0, Math.PI * 2);
      let transparency = 1 - (circles[i].radius / maxRadius);
      console.log('circle index ' + i);
      console.log(transparency);
      context.strokeStyle = 'rgba(0, 150, 255, ' + transparency + ')';
      context.stroke();
    }
  }

  function animate() {
      updateRipples();
      if(circles.length > 0) {
          requestAnimationFrame(animate);
      }
  }

  return (
    <div>
      <button onClick={createRipple}>add circle</button>
      <button onClick={() => updateRipples()}>update ripples</button>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={200} 
        style={{ border: '1px solid black' }} 
      />
    </div>
  );
};
