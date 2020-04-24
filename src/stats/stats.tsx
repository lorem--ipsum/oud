import React from 'react';

interface StatsProps {
  particlesCount: number;
  time: number;
}

export function Stats(props: StatsProps) {
  const { particlesCount, time } = props;

  const fpsHistory = React.useRef<number[]>([]);
  const now = React.useRef<number>();
  const before = React.useRef<number>(Date.now());
  const [fps, setFps] = React.useState<number>();
  const requestRef = React.useRef<number>();

  const animate = () => {
    requestRef.current = requestAnimationFrame(animate);

    now.current = Date.now();

    fpsHistory.current.push(1000 / (now.current - before.current));
    if (fpsHistory.current.length === 100) fpsHistory.current.shift();

    const latestFps = Math.round(
      fpsHistory.current.reduce((total, a) => total + a, 0) / fpsHistory.current.length,
    );

    if (latestFps !== fps) setFps(latestFps);

    before.current = now.current;
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => (requestRef.current ? cancelAnimationFrame(requestRef.current) : undefined);
  }, []);

  return (
    <div className="info">{`${particlesCount} particles, frame #${time}, ${
      isNaN(fps as any) ? '-' : fps
    }fps`}</div>
  );
}
