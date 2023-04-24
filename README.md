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
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}
```

Add a `<script>` element in the `<body>` to import the *canvasParticles.js* file.<br>
Add another `<script>` element in the `<body>` with the `Particles()` function to initialize the imported script.
```html
<!-- Link to canvasParticles.js file -->
<script src="canvasParticles.js"></script>
<script>
  "use strict";
  
  (function() {
    // Initialize the particles on the `.particles` element.
    window.addEventListener("DOMContentLoaded", function() {
      const particleCanvas = Particles("canvas.particles", {
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
      });

      // Dynamically resize the <canvas> to the height of the <body>.
      const resize = function() {
        let bodyHeight = document.body.querySelector("main").offsetHeight;
        particleCanvas.canvas.height = bodyHeight;
        particleCanvas.resizeCanvas();
        particleCanvas.newParticles();
      }
      window.addEventListener("resize", resize);
      resize();
    });
  })();
</script>
```

## Minimal example
```html
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
</head>
<body>
  <canvas class="particles"></canvas>

<!-- Link to canvasParticles.js file -->
<script src="canvasParticles.js" defer></script> <!-- Use defer instead of DOMContentLoaded -->
<script>
  Particles("canvas.particles");
</script>
</body>
```
