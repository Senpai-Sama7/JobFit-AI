import { useRef, useEffect } from 'react';

/**
 * Premium WebGL Background with animated gradient mesh
 * Creates a sophisticated, animated gradient effect similar to FAANG landing pages
 */
export function PremiumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Gradient orbs configuration
    const orbs = [
      { x: 0.2, y: 0.3, radius: 0.4, color: 'rgba(59, 130, 246, 0.15)', speed: 0.0003 },
      { x: 0.8, y: 0.2, radius: 0.35, color: 'rgba(139, 92, 246, 0.12)', speed: 0.0004 },
      { x: 0.5, y: 0.7, radius: 0.45, color: 'rgba(59, 130, 246, 0.1)', speed: 0.0002 },
      { x: 0.3, y: 0.8, radius: 0.3, color: 'rgba(168, 85, 247, 0.08)', speed: 0.0005 },
      { x: 0.7, y: 0.5, radius: 0.25, color: 'rgba(34, 197, 94, 0.06)', speed: 0.0003 },
    ];

    let time = 0;

    const animate = () => {
      time += 1;

      // Clear with subtle gradient base
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, 'rgba(248, 250, 252, 1)');
      bgGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      bgGradient.addColorStop(1, 'rgba(239, 246, 255, 0.5)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw animated orbs
      orbs.forEach((orb, index) => {
        const offsetX = Math.sin(time * orb.speed + index) * 50;
        const offsetY = Math.cos(time * orb.speed * 0.8 + index) * 30;

        const x = orb.x * width + offsetX;
        const y = orb.y * height + offsetY;
        const radius = orb.radius * Math.min(width, height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add subtle noise texture overlay
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 3;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

/**
 * Floating particles effect for premium feel
 */
export function FloatingParticles() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary-500/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Premium gradient mesh background (CSS-based alternative)
 */
export function GradientMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary gradient orb */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          left: '10%',
          top: '10%',
        }}
      />

      {/* Secondary gradient orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
          right: '5%',
          top: '20%',
          animationDelay: '2s',
          animationDuration: '8s',
        }}
      />

      {/* Accent gradient orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
          left: '30%',
          bottom: '10%',
          animationDelay: '4s',
          animationDuration: '10s',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export default PremiumBackground;
