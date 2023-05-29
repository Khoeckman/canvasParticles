# canvasParticles

## Description
In an HTML canvas, a bunch of floating particles are drawn that connect with a line when they are close to eachother.<br>
Creating a smooth, interactive background by simply placing a `canvas` over the background.

## Implementation
Particles will be drawn on this `<canvas>` element
```html
<canvas class="particles"></canvas>
```

Stretch the `<canvas>` over the background and place it behind all elements.
```css
canvas.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Place behind other elements as background */
}
```

Javascript use
```js
// Export to global scope
const Particles = function Particles(selector, options = {}) {
  return new Class{/* ... */ }(selector, options)
}

// Initialization
const selector = ""; // Query Selector for the canvas
const options = {}; // See below (optional parameter)
const particles = Particles(selector, options);
```

Add a `<script>` element (in the `<head>`) to import the *canvasParticles.js* file.<br>
Add a `<script>` element (in the `<body>`) using the `Particles()` function to initialize the imported script.
```html
<!-- Link to canvasParticles.js file -->
<script src="canvasParticles.js"></script>
<script>
  "use strict";
  
  (() => {
    // Initialize the particles on the `canvas.particles` element.
    window.addEventListener("DOMContentLoaded", function () {
      const canvasQuery = "canvas.particles";
      const options = {
        background: "#0e1013", // default: "#000000" (must be 6 hexadecimals)
        particleColor: "#ffff74", // default: "#ffffff" (must be 6 hexadecimals)
        pixelsPerParticle: 15000, // default: 10000
        connectDistance: 150, // default: 125
        interact: true, // default: false
        gravity: {
          enabled: true, // default: false (requires relatively a lot more performance when enabled)
          repulsive: 0.25, // default: 0 (usually between 0.05 and 0.50)
          pulling: 0.25 // default: 0 (usually between 0.05 and 0.50)
        }
      };
      const particleCanvas = Particles(canvasQuery, options);

      // Dynamically resize the <canvas> to the height of the <body>.
      const resize = function () {
        let height = document.body.offsetHeight;
        particles.canvas.style.height = height + 'px';
        particleCanvas.resizeCanvas();
        particleCanvas.newParticles();
      }
      resize();
      window.addEventListener("resize", resize);
    });
  })();
</script>
```

## Minimal example

What your full .html file would look like
```html
<html>
  
<head>
  <style>
    body {
      margin: 0;
    }

    canvas.particles {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
  </style>
  <!-- Link to canvasParticles.js file -->
  <script src="canvasParticles.js"></script>
</head>
  
<body>
  <canvas class="particles"></canvas>
  
  <script>
    const options = {}; // See above
    Particles("canvas.particles", options);
  </script>
</body>

</html>
```
