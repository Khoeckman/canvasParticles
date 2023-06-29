# canvasParticles

## Description

In an HTML canvas, a bunch of floating particles are drawn that connect with a line when they are close to eachother.<br>
Creating a smooth, interactive background by simply placing a canvas over the background.

Colors, interaction, gravity and other complex settings can be customized!

[Implementation](#implementation)<br>
[Options](#options)<br>
[Summary](#summary)

## Implementation

Particles will be drawn on this `<canvas>` element
```html
<canvas id="canvas-particles-1"></canvas>
```

Resize the `<canvas>` over the full page and place it behind all elements.
```css
#canvas-particles-1 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Place behind other elements to act as background */
}
```
<details>
  <summary><h3>JavaScript import using ES6 modules</h3></summary>

  Be aware that using ES6 modules is only possible when running the application on a (local) server.<br>
  [Same Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)


  Add a `<script>` element in the `<head>` to import *initParticles.mjs*.
  ```html
  <head>
    <script src="./initParticles.mjs" type="module"></script>
  </head>
  ```
  which imports *canvasParticles.mjs* and then invokes the `canvasParticles()` function.<br>
  Inside *initParticles.mjs*:
  ```js
  import { canvasParticles } from "./canvasParticles.mjs"; // Import canvasParticles.mjs
  
  // Initialization
  const selector = "#canvas-particles-1"; // Query Selector for the canvas
  const options = {}; // See options
  canvasParticles(selector, options); // Invocation
  ```
</details>

<details>
  <summary><h3>JavaScript import using global scope</h3></summary>
  
  Add a `<script>` element in the `<head>` to import the *canvasParticles.js* file.<br>
  ```html
  <head>
    <script src="./canvasParticles.js"></script>
  </head>
  ```

  Add an inline `<script>` element **at the very bottom of the `<body>`** that invokes the `canvasParticles()` function.
  ```html
  <body>
    ...

    <script>
      // Initialization
      const selector = "#canvas-particles-1"; // Query Selector for the canvas
      const options = {}; // See options
      canvasParticles(selector, options); // Invocation
    </script>
  </body>
  ```
</details>

## Options

The default value will be used when an option has an invalid value or is not specified.<br>
All recommendations are for 179 particles at 60 updates/s. (see particles.ppm)

```js
const options = {
  // Background of the canvas (can be any CSS supported value for the background property).
  background: 'linear-gradient(115deg, #354089, black)', // default: 'transparent'

  // The particles will update every refreshRate / framesPerUpdate.
  // Example: 60 fps / 2 framesPerUpdate = 30 updates/s   ;   144 fps / 3 framesPerUpdate = 48 updates/s
  framesPerUpdate: 1, // default: 1 (recommended: 1 - 3)

  // Create new particles when the canvas gets resized.
  resetOnResize: false, // default: true

  mouse: {
    // 0 = No interaction.
    // 1 = The mouse can shift the particles.
    // 2 = The mouse can move the particles.
    // NOTE: mouse.distRatio should be less than 1 to allow dragging, closer to 0 is easier to drag
    interactionType: 2, // default: 1

    // The maximum distance for the mouse to interact with the particles.
    // The value is multiplied by particles.connectDistance
    connectDistMult: 0.8, // default: 2÷3   ;   2 / 3 * particles.connectDistance (= 150) = 100 pixels

    // All particles within a [mouse.connectDistance / distRatio] pixel radius from the mouse
    // will be drawn to (mouse.connectDistance) pixels from the mouse.
    // Example: 150 connectDistance / 0.4 distRatio = all particles within a 375 pixel radius
    // NOTE: Keep this value above mouse.connectDistanceMultiplier
    distRatio: 1, // default: 2÷3 (recommended: 0.2 - 1)
  },

  particles: {
    // The color of the particles and their connections. Can be any CSS supported color format.
    color: '#88c8ffa0', // default: 'black'

    // Particles per million.
    // The amount of particles that will be created per million pixels the canvas covers (width * height).
    // Example: canvas dimensions = 1920 width * 937 height = 1799040 pixels
    //     1799040 pixels * 100 ppm / 1000000 = 179.904 = 179 particles
    // !!! IMPORTANT !!!: The amount of particles exponentially reduces performance.
    //     People with large screens will have a bad experience with high values.
    //     A solution is to use a higher particles.connectDistance with less particles.
    ppm: 100, // default: 100 (recommended: < 120)

    // The maximum amount of particles that can be created
    max: 200, // default: 500 (recommended: < 500)

    // Does not draw more connections from a particsle if it exceeds the max amount of work.
    // All connections will always be drawn if set to Infinity.
    // 1 work = [particles.connectDistance (= 150)] pixels of connection (or one line of 150 pixels).
    // Example: 10 maxWork = 10 * 150 connectDistance = max 1500 pixels of connections drawn per particle
    // !!! IMPORTANT !!!: Low values will stabilize performance at the cost of
    //     creating an ugly effect where connections might suddenly dissapear / reappear
    maxWork: 10, // default: Infinity (recommended: 5-10 @ connectDistance = 150 & maxParticles = 250)

    // The maximum length for a connection between 2 particles, heavily affects performance
    connectDistance: 150, // default: 150 (recommended: 50-250 @ maxParticles = 250)

    // The relative moving speed of the particles.
    // The moving speed is a random value between 0.5 and 1 pixels per update.
    // Example: 2 relSpeed * (.5 + Math.random() * .5) = 1 to 2 pixels per update
    // Example: 0.5 relSpeed * (.5 + Math.random() * .5) = 0.25 to 0.5 pixels per update
    relSpeed: 0.8, // default: 1

    // The speed at which the particles randomly change direction
    // 1 rotationSpeed = max direction change of 0.01rad or ~0.573° per update
    rotationSpeed: 1, // default: 2.00 (recommended: < 10.00)
  },

  gravity: {
    // !!! IMPORTANT !!!: Heavily reduces performance if one of these value is not 0

    // Apply repulsive force to particles close together
    repulsive: 2, // default: 0.00 (recommended: 0.50 - 5.00)

    // Apply pulling force to particles not close together
    // NOTE: This works very bad if gravity.repulsive is too low
    pulling: 0.00, // default: 0.00 (recommended: 0.01 - 0.10)

    // The smoothness of the gravitational forces
    // The force gets multiplied by the fricion every update.
    // The force remaning after x updates = force * friction ** x
    friction: 0.8 // default: 0.90 (recommended: 0.50 - 0.999)
  },
};
```

## Summary

These are a simple working examples.

<details>
  <summary><h3>Using ES6 modules</h3></summary>

  Be aware that using ES6 modules is only possible when running the application on a (local) server.<br>
  [Same Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

  ```html
  <html lang="en">
    
  <head>
    <meta charset="utf-8">
    <title>Canvas Particles</title>

    <script src="./initParticles.mjs" type="module"></script>

    <style>
      #canvas-particles-1 {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
    </style>
  </head>
    
  <body>
    <canvas id="canvas-particles-1"></canvas>
  </body>

  </html>
  ```
</details>

<details>
  <summary><h3>Using global scope</h3></summary>

  ```html
  <html lang="en">

  <head>
    <title>Canvas Particles</title>
    <meta charset="utf-8">

    <script src="./canvasParticles.js"></script>

    <style>
      #canvas-particles-1 {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
    </style>
  </head>
    
  <body>
    <canvas id="canvas-particles-1"></canvas>
    
    <script>
      const selector = '#canvas-particles-1'; // Query selector for the canvas
      const options = { 
        background: 'hsl(125, 42%, 35%)',

        mouse: {
          interactionType: 2,
        },

        particles: {
          color: 'rgba(150, 255, 105, 0.95)',
          max: 200,
          maxWork: 10,
        },
      };
      canvasParticles(selector, options);
    </script>
  </body>

  </html>
  ```
</details>
