# canvasParticles

## Description
In an HTML canvas, a bunch of floating particles that connect when they are close to eachother.<br>
Create a smooth, interactive background by simply placing a `canvas` on the background.

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

Import the `Particle` library.<br>
Add a `<script>` element in the `<body>` to import the *canvasParticles.js* file.<br>
Add another `<script>` element in the `<body>` with the `Particles()` function to initialize .
```html
<!-- Link to canvasParticles.js file -->
<script src="canvasParticles.js"></script>
<script>
  // Initialize the particles on the `.particles` element.
  window.addEventListener("load", function() {
    const particleCanvas = Particles(".particles", {
      background: "#0e1013", // default: "#000"
      particleColor: "#ffff74", // default: "#fff"
      pixelsPerParticle: 15000, // default: 10000
      connectDistance: 150, // default: 125
      interact: true, // default: false
      gravity: {
        enabled: true, // default: false
        repulsive: 0.25, // default: 0
        pulling: 0.25 // default: 0
      }
    });

    // Dynamically resize the <canvas> to the height of the <body>.
    window.addEventListener("resize", resize);
    resize();

    function resize() {
      let bodyHeight = document.body.querySelector("main").offsetHeight;
      particleCanvas.canvas.height = bodyHeight;
      particleCanvas.resizeCanvas();
      particleCanvas.newParticles();
    }
  });
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
<script src="canvasParticles.js"></script>
<script>
  window.addEventListener("load", Particles(".particles"));
</script>
</body>
```
