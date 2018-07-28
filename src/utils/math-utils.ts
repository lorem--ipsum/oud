export interface CartesianVector {
  x: number;
  y: number;
}

export interface PolarVector {
  radius: number;
  theta: number;
}

export function cartesianFromPolar(vector: PolarVector): CartesianVector {
  const { radius, theta } = vector;

  return {
    x: radius * Math.cos(theta),
    y: radius * Math.sin(theta)
  };
}

export function polarFromCartesian(vector: CartesianVector): PolarVector {
  const { x, y } = vector;

  return {
    radius: Math.sqrt(x * x + y * y),
    theta: Math.atan2(y, x)
  };
}
