// Copyright (c) 2023 Kyle Hoeckman, MIT License
// https://github.com/Khoeckman/canvasParticles/blob/main/LICENSE

/**
 * Interactive particles on a javaScript canvas.
 * 
 * @param {string} selector querySelector for the canvas
 * @param {object} options https://github.com/Khoeckman/canvasParticles#readme
 * @returns {canvasParticles} instance of canvasParticles class
 */
export const canvasParticles = function (selector, options = {}) {
  return new class canvasParticles {
    constructor(selector = 'canvas', options = {}) {
      // If canvas can not be selected
      if (typeof selector !== 'string') throw new TypeError('selector is not a string');
      if (!(document.querySelector(selector) instanceof Element)) throw new ReferenceError('selector is not defined');

      // Initialize canvas
      this.canvas = document.querySelector(selector);
      this.ctx = this.canvas.getContext('2d');

      // Format and store options
      this.options = {
        background: options.background ?? 'transparent',
        framesPerUpdate: Math.max(1, options.framesPerUpdate ?? 1),
        resetOnResize: !!(options.resetOnResize ?? true),
        mouse: {
          interactionType: +(options.mouse?.interactionType ?? 1),
          connectDist: +(options.mouse?.connectDistMult ?? 2 / 3),
          distRatio: +(options.mouse?.distRatio ?? 2 / 3)
        },
        particles: {
          color: options.particles?.color ?? 'black',
          ppm: +(options.particles?.ppm ?? 100),
          max: +(options.particles?.max ?? 500),
          maxWork: Math.max(0, options.particles?.maxWork ?? Infinity),
          connectDist: Math.max(1, options.particles?.connectDistance ?? 150),
          relSpeed: Math.max(0, (options.particles?.relSpeed ?? 1)),
          rotationSpeed: Math.max(0, (options.particles?.rotationSpeed ?? 2) / 100)
        },
        gravity: {
          repulsive: +(options.gravity?.repulsive ?? 0),
          pulling: +(options.gravity?.pulling ?? 0),
          friction: Math.max(0, (options.particles?.friction ?? .8)),
        }
      };

      // Use default value if user value could not be formatted
      if (isNaN(this.options.framesPerUpdate)) this.options.framesPerUpdate = 1;

      if (isNaN(this.options.mouse.interactionType)) this.options.mouse.interactionType = 1;
      if (isNaN(this.options.mouse.connectDist)) this.options.mouse.connectDist = 2 / 3;
      if (isNaN(this.options.mouse.distRatio)) this.options.mouse.distRatio = 2 / 3;

      if (isNaN(this.options.particles.ppm)) this.options.particles.ppm = 100;
      if (isNaN(this.options.particles.max)) this.options.particles.max = 500;
      if (isNaN(this.options.particles.maxWork)) this.options.particles.maxWork = Infinity;
      if (isNaN(this.options.particles.connectDist)) this.options.particles.connectDist = 150;
      if (isNaN(this.options.particles.relSpeed)) this.options.particles.relSpeed = 1;
      if (isNaN(this.options.particles.rotationSpeed)) this.options.particles.rotationSpeed = .02;

      if (isNaN(this.options.gravity.repulsive)) this.options.gravity.repulsive = 0;
      if (isNaN(this.options.gravity.pulling)) this.options.gravity.pulling = 0;
      if (isNaN(this.options.gravity.friction)) this.options.gravity.friction = .9;

      this.options.mouse.connectDist *= this.options.particles.connectDist;

      // Format particle color and opacity
      this.ctx.fillStyle = this.options.particles.color;

      if (this.ctx.fillStyle[0] === '#') {
        this.options.particles.opacity = { value: 1, hex: 'ff' };
        this.options.particles.color = this.ctx.fillStyle;

      } else {
        // Example: extract 0.25 from rgba(136, 244, 255, 0.25) and convert to range 0x00 to 0xff and store as a 2 char string
        let value = ~~(this.ctx.fillStyle.split(',').at(-1).slice(1, -1) * 255);
        this.options.particles.opacity = { value: value / 255, hex: value.toString(16) };

        // Example: extract 136, 244 and 255 from rgba(136, 244, 255, 0.25) and convert to '#001122' format
        this.ctx.fillStyle = this.ctx.fillStyle.split(',').slice(0, -1).join(',') + ', 1)';
        this.options.particles.color = this.ctx.fillStyle;
      }

      window.addEventListener('resize', () => this.resizeCanvas());

      window.addEventListener('mousemove', event => {
        this.mouseX = event.clientX - this.canvas.offsetLeft + window.scrollX;
        this.mouseY = event.clientY - this.canvas.offsetTop + window.scrollY;
      });

      window.addEventListener('wheel', event => {
        let updateScrollPosition = setInterval(() => {
          this.mouseX = event.clientX - this.canvas.offsetLeft + window.scrollX;
          this.mouseY = event.clientY - this.canvas.offsetTop + window.scrollY;
        }, 1000 / this.options.framesPerUpdate);

        setTimeout(() => clearInterval(updateScrollPosition), 100);
      });

      this.canvas.style.background = this.options.background;
      this.resizeCanvas();
      requestAnimationFrame(() => this.animation());
    }

    resizeCanvas = function () {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;

      this.mouseX = Infinity;
      this.mouseY = Infinity;

      this.updateCount = Infinity;
      this.width = this.canvas.width + this.options.particles.connectDist * 2;
      this.height = this.canvas.height + this.options.particles.connectDist * 2;
      this.offX = (this.canvas.width - this.width) / 2;
      this.offY = (this.canvas.height - this.height) / 2;

      // Amount of particles to be created
      this.len = Math.min(
        this.options.particles.max,
        Math.floor(this.options.particles.ppm * this.width * this.height / 1000000)
      );

      if (this.options.resetOnResize || typeof this.particles === 'undefined') this.newParticles();
      else this.overflowParticles();
    }

    newParticles = function () {
      if (this.len === Infinity) throw new RangeError('cannot create an infinite amount of particles');
      this.particles = [];
      for (let i = 0; i < this.len; i++) this.createParticle();
    }

    overflowParticles = function () {
      if (this.len === Infinity) throw new RangeError('cannot create an infinite amount of particles');
      this.particles = this.particles.slice(0, this.len);
      while (this.len > this.particles.length) this.createParticle();
    }

    createParticle = function (posX, posY, dir, speed, size) {
      this.particles.push({
        posX: posX - this.offX || Math.random() * this.width, // Logical position in pixels
        posY: posY - this.offY || Math.random() * this.height, // Logical position in pixels
        x: posX, // Visual position in pixels
        y: posY, // Visual position in pixels
        velX: 0, // Horizonal speed in pixels per update
        velY: 0, // Vertical speed in pixels per update
        offX: 0, // horizontal distance in pixels from drawn to logical position
        offY: 0, // vertical distance in pixels from drawn to logical position
        dir: dir || Math.random() * 2 * Math.PI, // direction in radians
        speed: speed || (.5 + Math.random() * .5) * this.options.particles.relSpeed, // velocity in pixels per update
        size: size || .5 + Math.random() ** 5 * 2 // ray in pixels of the particle
      });
      let point = this.particles.at(-1);
      point.isVisible = this.isVisible(point); // Whether the particles position is within the bounds of the canvas
    }

    update = function () {
      if (this.options.gravity.repulsive !== 0 || this.options.gravity.pulling !== 0) {
        for (let i = 0; i < this.len; i++) {
          for (let j = i + 1; j < this.len; j++) {
            // Code in this scope runs [particles ** 2 / 2] times per frame!
            const pointA = this.particles[i];
            const pointB = this.particles[j];
            const dist = Math.hypot(pointA.posX - pointB.posX, pointA.posY - pointB.posY);
            const distRatio = 1 / Math.max(dist, 10);
            const angle = Math.atan2(pointB.posY - pointA.posY, pointB.posX - pointA.posX);

            if (dist < this.options.particles.connectDist / 2) {
              // apply repulsive force on all particles close together
              const grav = distRatio ** 1.8 * this.options.particles.connectDist * this.options.gravity.repulsive;
              const gravX = Math.cos(angle) * grav;
              const gravY = Math.sin(angle) * grav;
              pointA.velX -= gravX;
              pointA.velY -= gravY;
              pointB.velX += gravX;
              pointB.velY += gravY;

            } else if (this.options.gravity.pulling !== 0) {
              // apply pulling force on all particles not close together
              const grav = distRatio ** 1.8 * this.options.particles.connectDist * this.options.gravity.pulling;
              const gravX = Math.cos(angle) * grav;
              const gravY = Math.sin(angle) * grav;
              pointA.velX += gravX;
              pointA.velY += gravY;
              pointB.velX -= gravX;
              pointB.velY -= gravY;
            }
          }
        }
      }

      for (let point of this.particles) {
        point.dir = (point.dir + Math.random() * this.options.particles.rotationSpeed * 2 - this.options.particles.rotationSpeed) % (2 * Math.PI);
        point.velX *= this.options.gravity.friction;
        point.velY *= this.options.gravity.friction;
        point.posX = (point.posX + point.velX + Math.sin(point.dir) * point.speed % this.width + this.width) % this.width;
        point.posY = (point.posY + point.velY + Math.cos(point.dir) * point.speed % this.height + this.height) % this.height;

        const distX = point.posX + this.offX - this.mouseX;
        const distY = point.posY + this.offY - this.mouseY;

        if (this.options.mouse.interactionType !== 0) {
          const distRatio = this.options.mouse.connectDist / Math.hypot(distX, distY);

          if (this.options.mouse.distRatio < distRatio) {
            point.offX += (distRatio * distX - distX - point.offX) / 4;
            point.offY += (distRatio * distY - distY - point.offY) / 4;

          } else {
            point.offX -= point.offX / 4;
            point.offY -= point.offY / 4;
          }
        }
        point.x = point.posX + point.offX + this.offX;
        point.y = point.posY + point.offY + this.offY;

        if (this.options.mouse.interactionType === 2) {
          // Make the mouse actually move the particles their position instead of just visually
          point.posX = point.x - this.offX;
          point.posY = point.y - this.offY;
        }
        point.isVisible = this.isVisible(point);
      }
    }

    isVisible = function (point) {
      return !(
        point.posX < Math.abs(this.offX) ||
        point.posX > this.width - Math.abs(this.offX) ||
        point.posY < Math.abs(this.offY) ||
        point.posY > this.height - Math.abs(this.offY)
      );
    }

    render = function () {
      this.canvas.width = this.canvas.width; // Clear canvas
      this.ctx.fillStyle = this.options.particles.color + this.options.particles.opacity.hex;
      this.ctx.lineWidth = 1;

      for (let point of this.particles) {
        if (point.isVisible) {
          // Draw the particle as a square if the size is smaller than 1 pixel (±183% faster than drawing only circles)
          if (point.size > 1) {
            // Draw circle
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

          } else {
            // Draw square (±335% faster than circle)
            this.ctx.fillRect(point.x - point.size, point.y - point.size, point.size * 2, point.size * 2);
          }
        }
      }

      const drawAll = this.options.particles.connectDist >= Math.min(this.width, this.height);

      const maxWorkPerParticle = this.options.particles.connectDist * this.options.particles.maxWork;
      const maxWork = maxWorkPerParticle * this.len;
      let work = 0;

      for (let i = 0; i < this.len; i++) {
        let particleWork = 0;

        for (let j = i + 1; (work < maxWork || particleWork < maxWorkPerParticle) && j < this.len; j++) {
          // Code in this scope runs [particles ** 2 / 2] times per frame!
          const pointA = this.particles[i];
          const pointB = this.particles[j];

          // A line should be drawn if at least one point is on screen 
          if (pointA.isVisible || pointB.isVisible || drawAll) {
            const dist = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);

            // Connect the 2 points with a line if the distance is small enough
            if (dist < this.options.particles.connectDist) {
              // Draw the line more transparently
              if (dist >= this.options.particles.connectDist / 2) {
                let alpha = Math.floor(Math.min(this.options.particles.connectDist / dist - 1, 1) * 255 * this.options.particles.opacity.value).toString(16);
                this.ctx.strokeStyle = this.options.particles.color + (alpha.length === 2 ? alpha : '0' + alpha);

              } else this.ctx.strokeStyle = this.options.particles.color + this.options.particles.opacity.hex;

              // Draw lines between the visual positions of the particles
              this.ctx.beginPath();
              this.ctx.moveTo(pointA.x, pointA.y);
              this.ctx.lineTo(pointB.x, pointB.y);
              this.ctx.stroke();

              particleWork += dist;
              work += dist;
            }
          }
        }
      }
    }

    animation = function () {
      requestAnimationFrame(() => this.animation());

      if (++this.updateCount >= this.options.framesPerUpdate) {
        this.updateCount = 0;
        this.update();
        this.render();
      }
    }
  }(selector, options);
};
