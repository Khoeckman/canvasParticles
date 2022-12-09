# canvasParticles
Create a smooth, interactive background by simply placing a canvas on the background.

```html
<canvas class="particles"></canvas>
```

```css
canvas.particles {
  position: absolute;
  width: 100%;
  height: 100vh;
}
```

```js
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
