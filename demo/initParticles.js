import CanvasParticles from './canvasParticles.mjs'

//  Initialize first canvas
new CanvasParticles('#canvas-particles-1', {
  background: 'linear-gradient(115deg, #354089, black)',
  resetOnResize: false,
  mouse: {
    interactionType: 2,
    connectDistMult: 0.8,
    distRatio: 1,
  },
  particles: {
    color: '#88c8ffa0',
    max: 150,
    maxWork: 10,
    relSpeed: 0.8,
    rotationSpeed: 1,
  },
  gravity: {
    repulsive: 2,
    friction: 0.8,
  },
}).start()

// Initialize second canvas
new CanvasParticles('#canvas-particles-2', {
  background: 'hsl(125, 42%, 35%)',
  mouse: {
    interactionType: 2,
  },
  particles: {
    color: 'rgba(150, 255, 105, 0.95)',
    max: 200,
    maxWork: 10,
  },
}).start()

// Initialize third canvas
new CanvasParticles('#canvas-particles-3', {
  background: '#423',
  resetOnResize: false,
  mouse: {
    connectDistMult: 0.5,
    distRatio: 0.75,
  },
  particles: {
    color: '#f45c',
    ppm: 120,
    max: 120,
    connectDistance: 350,
    rotationSpeed: 5,
  },
  gravity: {
    repulsive: 16,
    pulling: 6,
    friction: 0.8,
  },
}).start()
