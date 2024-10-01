# Canvas Particles JS

<span class="badge-npmversion"><a href="https://npmjs.org/package/canvasparticles-js" title="View this project on NPM"><img src="https://img.shields.io/npm/v/canvasparticles-js.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/canvasparticles-js" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/canvasparticles-js.svg" alt="NPM downloads" /></a></span>
<span><a href="https://www.jsdelivr.com/package/npm/canvasparticles-js" title="View this project on jsDelivr"><img src="https://data.jsdelivr.com/v1/package/npm/canvasparticles-js/badge?style=rounded" alt="jsDelivr hits" /></a></span>

## Description

In an HTML canvas, a bunch of floating particles connected with lines when they approach eachother.
Creating a fun and interactive background. Colors, interaction and gravity can be customized!

[Showcase](#showcase)<br>
[Implementation](#implementation)<br>
[Options](#options)<br>
[Example](#example)

## Showcase

If you dont like reading documentation this website is for you:<br>
[http://kylehoeckman.great-site.net/canvas-particles/](http://kylehoeckman.great-site.net/canvas-particles/)

## Implementation

Particles will be drawn onto this `<canvas>` element

```html
<canvas id="canvas-particles"></canvas>
```

Resize the `<canvas>` so it covers the whole page and place it behind all elements.

```css
#canvas-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Place behind other elements to act as background */
}
```

<details>
  <summary><h3>Import globally</h3></summary>
  
  Add a `<script>` element in the `<head>` to import the *canvasParticles.js* file.<br>
  ```html
  <head>
    <script src="./canvasParticles.js" defer></script>
  </head>
  ```

Add an inline `<script>` element at the very bottom of the `<body>`.

```html
<body>
  ...

  <script>
    const initParticles = () => {
      const selector = '#canvas-particles' // Query Selector for the canvas
      const options = {} // See #options
      new CanvasParticles(selector, options).start()
    }
    document.addEventListener('DOMContentLoaded', initParticles)
  </script>
</body>
```

</details>

<details>
  <summary><h3>Import as ES module</h3></summary>

Be aware that using ES modules is only possible when running the application on a (local) server.<br>
[Same Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

Add a `<script>` element in the `<head>` to import _initParticles.js_.

```html
<head>
  <script src="./initParticles.js" type="module"></script>
</head>
```

Inside _initParticles.js_:

```js
import CanvasParticles from './canvasParticles.mjs'

const selector = '#canvas-particles' // Query Selector for the canvas
const options = {} // See #options
new CanvasParticles(selector, options).start()
```

</details>

<details>
  <summary><h3>Import with jsDelivr</h3></summary>

Add a `<script>` element in the `<head>` to import `CanvasParticles`.

```html
<head>
  <script src="https://cdn.jsdelivr.net/npm/canvasparticles-js@3.2/canvasParticles.min.js" defer></script>
</head>
```

</details>

<br>
<br>

### Start animating

```js
const selector = '#canvas-particles' // Query Selector for the canvas
const options = {} // See #options
new CanvasParticles(selector, options).start()
```

### Starting and stopping animation

```js
const particles = new CanvasParticles(selector, options)
particles.start()
particles.stop()
```

### Update options on the fly

```js
const particles = new CanvasParticles(selector, options)
particles.options.particles.color = 'blue'

// Required usage of setter for options.background and options.particles.color
particles.setBackground('red')
particles.setParticleColor('hsl(149, 100%, 50%)')

// Changing options.particles.ppm or options.particles.max requires a reset
particles.options.particles.ppm = 100
particles.options.particles.max = 300
particles.newParticles() // required reset

// All other options work on the fly
particles.options.gravity.repulsive = 1
```

## Options

Configuration options for the particles and their behavior.<br>
Play around with these values: [Sandbox](http://kylehoeckman.great-site.net/canvas-particles/#sandbox)

<details>
  <summary><h3>Options structure</h3></summary>

The default value will be used when an option is assigned an invalid value.<br>
All recommendations are for a 179 particles at 60 updates/s. (see options.particles.ppm)

```js
const options = {
  /** @param {string} [options.background=false] - Background of the canvas. Can be any CSS supported value for the background property.
   * @note No background will be set if background is not a string.
   */
  background: 'linear-gradient(115deg, #354089, black)',

  /** @param {integer} [options.framesPerUpdate=1] - How many times the same frame will be shown before an update happens.
   * @example 60 fps / 2 framesPerUpdate = 30 updates/s
   * @example 144 fps / 3 framesPerUpdate = 48 updates/s
   * */
  framesPerUpdate: 1, // recommended: 1 - 3

  /** @param {boolean} [options.resetOnResize=false] - Create new particles when the canvas gets resized.
   * @info If false, will instead add or remove a few particles to match particles.ppm
   */
  resetOnResize: false,

  /** @param {Object} [options.mouse] - Mouse interaction settings. */
  mouse: {
    /** @param {0|1|2} [options.mouse.interactionType=1] - The type of interaction the mouse will have with particles.
     * 0 = No interaction.
     * 1 = The mouse can visually shift the particles.
     * 2 = The mouse can move the particles.
     * @note mouse.distRatio should be less than 1 to allow dragging, closer to 0 is easier to drag
     */
    interactionType: 2,

    /** @param {float} [options.mouse.connectDistMult=2÷3] - The maximum distance for the mouse to interact with the particles.
     * The value is multiplied by particles.connectDistance
     * @example 0.8 connectDistMult * 150 particles.connectDistance = 120 pixels
     */
    connectDistMult: 0.8,

    /** @param {number} [options.mouse.distRatio=2÷3] - All particles within set radius from the mouse will be drawn to mouse.connectDistance pixels from the mouse.
     * @example radius = 150 connectDistance / 0.4 distRatio = 375 pixels
     * @note Keep this value above mouse.connectDistMult
     */
    distRatio: 1, // recommended: 0.2 - 1
  },

  /** @param {Object} [options.particles] - Particle settings. */
  particles: {
    /** param {string} [options.particles.color='black'] - The color of the particles and their connections. Can be any CSS supported color format. */
    color: '#88c8ffa0',

    /** @param {number} [options.particles.ppm=100] - Particles per million (ppm).
     * This determines how many particles are created per million pixels of the canvas.
     * @example FHD on Chrome = 1920 width * 937 height = 1799040 pixels; 1799040 pixels * 100 ppm / 1000000 = 179.904 = 179 particles
     * @important The amount of particles exponentially reduces performance.
     * People with large screens will have a bad experience with high values.
     * One solution is to increase particles.connectDistance and decrease this value.
     */
    ppm: 100, // recommended: < 120

    /** @param {number} [options.particles.max=500] - The maximum number of particles allowed. */
    max: 200, // recommended: < 500

    /** @param {number} [options.particles.maxWork=Infinity] - The maximum "work" a particle can perform before its connections are no longer drawn.
     * @example 10 maxWork = 10 * 150 connectDistance = max 1500 pixels of lines drawn per particle
     * @important Low values will stabilize performance at the cost of creating an ugly effect where connections may flicker.
     */
    maxWork: 10,

    /** @param {number} [options.particles.connectDistance=150] - The maximum distance for a connection between 2 particles.
     * @note Heavily affects performance. */
    connectDistance: 150,

    /** @param {number} [options.particles.relSpeed=1] - The relative moving speed of the particles.
     * The moving speed is a random value between 0.5 and 1 pixels per update multiplied by this value.
     */
    relSpeed: 0.8,

    /** @param {number} [options.particles.relSize=1] - The relative size of the particles.
     * The ray is a random value between 0.5 and 2.5 pixels multiplied by this value.
     */
    relSize: 1.1,

    /** @param {number} [options.particles.rotationSpeed=2] - The speed at which the particles randomly changes direction.
     * @example 1 rotationSpeed = max direction change of 0.01 radians per update
     */
    rotationSpeed: 1, // recommended: < 10
  },

  /** @param {Object} [options.gravity] - Gravitational force settings.
   * @important Heavily reduces performance if gravity.repulsive or gravity.pulling is not equal to 0
   */
  gravity: {
    /** @param {number} [options.gravity.repulsive=0] - The repulsive force between particles. */
    repulsive: 2, // recommended: 0.50 - 5.00

    /** @param {number} [options.gravity.pulling=0] - The attractive force pulling particles together. Works poorly if `gravity.repulsive` is too low.
     * @note gravity.repulsive should be great enough to prevent forming a singularity.
     */
    pulling: 0.0, // recommended: 0.01 - 0.10

    /** @param {number} [options.gravity.friction=0.9] -  The smoothness of the gravitational forces.
     * The force gets multiplied by the fricion every update.
     * @example force after x updates = force * friction ** x
     */
    friction: 0.8, // recommended: 0.500 - 0.999
  },
}
```

</details>

## Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="./canvasParticles.js" defer></script>
    <style>
      #canvas-particles {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
    </style>
  </head>

  <body>
    <canvas id="canvas-particles"></canvas>

    <script>
      const selector = '#canvas-particles'
      const options = {
        background: 'hsl(125, 42%, 35%)',
        mouse: {
          interactionType: 2,
        },
        particles: {
          color: 'rgba(150, 255, 105, 0.95)',
          max: 200,
        },
      }
      new CanvasParticles(selector, options).start()
    </script>
  </body>
</html>
```
