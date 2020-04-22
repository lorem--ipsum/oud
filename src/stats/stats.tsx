import * as classNames from 'classnames';
import * as React from 'react';

import './stats.scss';

interface StatsProps {
  particlesCount: number;
  time: number;
}

export function Stats(props: StatsProps) {
  const { particlesCount, time } = props;

  const fpsHistory = React.useRef<number[]>([]);
  const now = React.useRef<number>(Date.now());
  const before = React.useRef<number>();
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
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="info">{`${particlesCount} particles, frame #${time}, ${
      isNaN(fps) ? '-' : fps
    }fps`}</div>
  );
}
