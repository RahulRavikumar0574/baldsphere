import React, { useCallback, useState, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const ParticlesBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full z-0"
      style={{ pointerEvents: 'none' }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 60,
          background: {
            color: "transparent", // Keeps body color visible
          },
          particles: {
            number: {
              value: isMobile ? 50 : 100, // Fewer particles on mobile for performance
              density: {
                enable: true,
                value_area: 800,
              },
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.4,
              random: true,
            },
            size: {
              value: { min: 1, max: 4 },
            },
            move: {
              enable: true,
              speed: isMobile ? 0.5 : 0.7, // Slower on mobile
              direction: "none",
              outModes: "out",
            },
            color: {
              value: ["000000"], // Gold, Tomato, DodgerBlue
            },
            links: {
              enable: true,
              distance: isMobile ? 80 : 120, // Shorter links on mobile
              color: "#f0b100",
              opacity: 0.3,
              width: 1,
            },
          },
          interactivity: {
            events: {
              onHover: { enable: !isMobile, mode: "repulse" }, // Disable on mobile
              onClick: { enable: !isMobile, mode: "push" }, // Disable on mobile
            },
            modes: {
              repulse: { distance: 100 },
              push: { quantity: 4 },
            },
          },
          detectRetina: true,
        }}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default ParticlesBackground;