import React, { useEffect, useRef } from 'react';

export function NeuralAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Make canvas responsive
    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize particles (nodes in the neural net)
    const numParticles = window.innerWidth < 768 ? 30 : 60;
    const particles = Array.from({ length: numParticles }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update positions
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounce smoothly off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if close enough
          if (dist < 140) {
            ctx.beginPath();
            // Opacity scales with distance
            const opacity = 1 - dist / 140;
            // Primary-500 color (rgb: 99, 102, 241) to AI-500 color
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.6})`; 
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.9)'; // ai-500 (rgb: 14, 165, 233)
        
        // Add a subtle glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(14, 165, 233, 0.6)';
        ctx.fill();
        
        // Reset shadow for lines
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 dark:opacity-80 dark:mix-blend-screen transition-opacity duration-700">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export default NeuralAnimation;
