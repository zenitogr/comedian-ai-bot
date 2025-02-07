"use client";

import { useEffect, useRef } from 'react';

export function MatrixRain() {
  console.debug('🎨 Rendering MatrixRain component');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    console.debug('🎨 Setting up MatrixRain effect');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('⚠️ Canvas ref not available');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('❌ Could not get 2D context from canvas');
      return;
    }

    const updateDimensions = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Reset drops when dimensions change
      const columns = Math.floor(width / 20);
      dropsRef.current = Array(columns).fill(1);
      console.info('📐 Canvas dimensions updated:', { width, height, columns });
    };

    // Initial setup
    console.debug('🎨 Performing initial setup');
    updateDimensions();

    const chars = "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ".split("");
    let animationFrameId: number;
    let frameCount = 0;
    const FPS_LOG_INTERVAL = 1000; // Log FPS every second
    let lastFpsLog = performance.now();

    function draw() {
      if (!canvas || !context) {
        console.warn('⚠️ Canvas or context not available in draw loop');
        return;
      }

      frameCount++;
      const now = performance.now();
      if (now - lastFpsLog > FPS_LOG_INTERVAL) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsLog));
        console.debug('🎨 Matrix animation FPS:', fps);
        frameCount = 0;
        lastFpsLog = now;
      }

      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '15px monospace';

      for (let i = 0; i < dropsRef.current.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        context.fillStyle = `rgba(0, 255, ${Math.random() * 255}, 0.7)`;
        context.fillText(text, i * 20, dropsRef.current[i] * 20);

        if (dropsRef.current[i] * 20 > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }

        dropsRef.current[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    // Start animation
    console.info('🎬 Starting matrix animation');
    animationFrameId = requestAnimationFrame(draw);

    // Handle resize
    console.debug('🎨 Setting up resize handler');
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => {
      console.info('🧹 Cleaning up MatrixRain effect');
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []); // Empty dependency array since we're using refs

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0"
    />
  );
} 