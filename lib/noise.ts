// Simple Perlin-like noise implementation for procedural generation

export function createNoise(seed: number = 0) {
  const p = new Uint8Array(512);
  const perm = new Uint8Array(256);
  
  // Initialize permutation table with seed
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
  }
  
  // Shuffle using seed
  let random = seed || Math.random() * 10000;
  for (let i = 255; i > 0; i--) {
    random = (random * 16807) % 2147483647;
    const j = Math.floor((random / 2147483647) * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  
  for (let i = 0; i < 512; i++) {
    p[i] = perm[i & 255];
  }

  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  function grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return function noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = fade(x);
    const v = fade(y);
    
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    
    return lerp(
      lerp(grad(p[A], x, y), grad(p[B], x - 1, y), u),
      lerp(grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1), u),
      v
    );
  };
}

// Fractal Brownian Motion for more complex noise
export function fbm(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

// Utility to generate random values with seed
export function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
