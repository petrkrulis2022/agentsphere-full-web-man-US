import React, { useEffect, useState } from "react";

/**
 * TouchIndicator Component
 * Shows visual feedback for touch/click events on mobile devices
 * Perfect for screen recordings to show where user is tapping
 */
const TouchIndicator = () => {
  const [touches, setTouches] = useState([]);

  useEffect(() => {
    let touchId = 0;

    const handleTouch = (e) => {
      const newTouches = [];

      // Handle all touch points (multi-touch support)
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        newTouches.push({
          id: touchId++,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
        });
      }

      setTouches((prev) => [...prev, ...newTouches]);
    };

    const handleClick = (e) => {
      // Also handle mouse clicks for desktop testing
      const newTouch = {
        id: touchId++,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      };

      setTouches((prev) => [...prev, newTouch]);
    };

    // Add event listeners
    document.addEventListener("touchstart", handleTouch, { passive: true });
    document.addEventListener("click", handleClick);

    // Cleanup old touches periodically
    const cleanupInterval = setInterval(() => {
      setTouches((prev) =>
        prev.filter((touch) => Date.now() - touch.timestamp < 1000),
      );
    }, 100);

    return () => {
      document.removeEventListener("touchstart", handleTouch);
      document.removeEventListener("click", handleClick);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100000,
      }}
    >
      {touches.map((touch) => {
        const age = Date.now() - touch.timestamp;
        const opacity = Math.max(0, 1 - age / 1000);
        const scale = 1 + (age / 1000) * 2;

        return (
          <div
            key={touch.id}
            style={{
              position: "absolute",
              left: touch.x,
              top: touch.y,
              width: "60px",
              height: "60px",
              marginLeft: "-30px",
              marginTop: "-30px",
              borderRadius: "50%",
              border: "4px solid #00ff00",
              background:
                "radial-gradient(circle, rgba(0,255,0,0.4) 0%, rgba(0,255,0,0) 70%)",
              opacity: opacity,
              transform: `scale(${scale})`,
              transition: "opacity 0.1s, transform 0.1s",
              pointerEvents: "none",
              boxShadow: "0 0 20px rgba(0,255,0,0.6)",
            }}
          />
        );
      })}
    </div>
  );
};

export default TouchIndicator;
