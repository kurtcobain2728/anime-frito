import React, { useEffect, useRef } from 'react';
import './SakuraBackground.css';

const SakuraBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const petals = [];
    const numPetals = 40;

    class Petal {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.size = Math.random() * 6 + 4;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5;
        this.rotation += this.rotationSpeed;

        if (this.y > height) {
          this.y = -this.size;
          this.x = Math.random() * width;
        }
        if (this.x > width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = width + this.size;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffb7c5';
        ctx.beginPath();
        
        // Simple petal shape
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.size, -this.size/2, this.size, this.size/2);
        ctx.quadraticCurveTo(0, this.size, 0, 0);
        
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < numPetals; i++) {
      petals.push(new Petal());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const petal of petals) {
        petal.update();
        petal.draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="sakura-container">
      <div className="sakura-bg-image" />
      <canvas ref={canvasRef} className="sakura-canvas" />
    </div>
  );
};

export default SakuraBackground;
