# canvasParticles

## Description
In an HTML canvas, a bunch of floating particles that connect when they are close to eachother.<br>
Create a smooth, interactive background by simply placing a `canvas` on the background.

## How to use

Particles will be drawn on this `canvas` element
```html
<canvas class="particles"></canvas>
```

```css
canvas.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}
```

Import `Particle` function

```html
<script src="./js/canvasParticles.js"></script>
```

`script` tag in the `body`.

```js
// Initialize the `Particle` function.
window.addEventListener("load", function() {
  const particleCanvas = Particles(".particles", {
    background: "#0e1013", // default: "#000"
    particleColor: "#ffff74", // default: "#fff"
    pixelsPerParticle: 15000, // default: 10000
    connectDistance: 150, // default: 125
    gravity: {
      enabled: true, // default: false
      repulsive: 0.25, // default: 0
      pulling: 0.25 // default: 0
    }
  });
  
  // Resize canvas to the bottom of the webpage instead of the viewport.
  window.addEventListener("resize", resize);
  resize();
  
  const siteWrapper = document.getElementById("site-wrapper"); // Dummy element at the bottom of the webpage.

  function resize() {
    particleCanvas.canvas.height = Math.max(window.innerHeight, siteWrapper.offsetTop);
    particleCanvas.resizeCanvas();
    particleCanvas.newParticles();
  }
});
```

## Simplified example

```html
<head>
<style>
  canvas.particles {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
  <canvas class="particles"></canvas>

<script src="./js/canvasParticles.js"></script>
<script>
  window.addEventListener("load", Particles(".particles"));
</script>
</body>
```
