// Copyright (c) 2022 Kyle Hoeckman
// https://github.com/Khoeckman/canvasParticles/blob/main/LICENSE

"use strict";

const Particles = function(selector, options = {}) {
  return new class {
    constructor(selector = "canvas", options = {}) {
      if (typeof document.querySelector(selector) !== "string") {
        throw new TypeError('"selector" is not a string');
      }

      this.canvas = document.querySelector(selector);
      this.ctx = this.canvas.getContext("2d");

      this.options = {
        background: options.background ?? "#000000",
        particleColor: options.particleColor ?? "#ffffff",
        pixelsPerParticle: options.pixelsPerParticle ?? 10000,
        connectDistance: options.connectDistance ?? 125,
        interact: options.interact ?? false,
        gravity: {
          enabled: options.gravity?.enabled ?? false,
          repulsive: options.gravity?.repulsive ?? 0,
          pulling: options.gravity?.pulling ?? 0
        }
      };
      this.canvas.style.background = this.options.background ?? "#000";

      this.resizeCanvas();
      this.newParticles();
      requestAnimationFrame(() => this.animation());

      window.addEventListener("resize", e => {
        this.resizeCanvas();
        this.newParticles();
      });

      window.addEventListener("mousemove", e => {
        this.mouseX = e.clientX - this.canvas.offsetLeft + window.pageXOffset;
        this.mouseY = e.clientY - this.canvas.offsetTop + window.pageYOffset;
      });

      window.addEventListener("wheel", e => {
        setTimeout(() => {
          this.mouseX = e.clientX - this.canvas.offsetLeft + window.pageXOffset;
          this.mouseY = e.clientY - this.canvas.offsetTop + window.pageYOffset;
        }, 100);
      });
    }

    resizeCanvas = function() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.mouseX = -Infinity;
      this.mouseY = -Infinity;
    }

    newParticles = function() {
      this.count = Infinity;
      this.width = this.canvas.width + this.options.connectDistance * 2;
      this.height = this.canvas.height + this.options.connectDistance * 2;
      this.offX = (this.canvas.width - this.width) / 2;
      this.offY = (this.canvas.height - this.height) / 2;
      this.particles = [];

      for (let i = 0, len = Math.floor(this.width * this.height / this.options.pixelsPerParticle); i < len; i++) {
        let posX = Math.random() * this.width,
            posY = Math.random() * this.height;

        this.createParticle(posX, posY);
      }
      this.len = this.particles.length;
    }

    createParticle = function(posX, posY, dir, vel, size) {
      this.particles.push({
        x: posX,
        y: posY,
        posX: posX - this.offX || Math.random() * this.width,
        posY: posY - this.offY || Math.random() * this.height,
        offX: 0,
        offY: 0,
        dir: dir || Math.random() * 2 * Math.PI,
        vel: vel || .5 + Math.random() * .5,
        size: size || .5 + Math.random() ** 5 * 2
      });
    }

    update = function() {
      if (this.options.gravity?.enabled) {
        for (let i = 0; i < this.len; i++) {
          for (let j = i + 1; j < this.len; j++) {
            let pointA = this.particles[i],
                pointB = this.particles[j],
                dist = Math.hypot(pointA.posX - pointB.posX, pointA.posY - pointB.posY),
                distRatio = this.options.connectDistance / Math.max(dist, this.options.connectDistance / 20),
                angle = Math.atan2(pointB.posY - pointA.posY, pointB.posX - pointA.posX);

            if (dist < this.options.connectDistance / .5) {
              // apply repulsive force on all particles close together
              let grav = distRatio ** 2 * this.options.gravity.repulsive,
                  gravX = Math.cos(angle) * grav,
                  gravY = Math.sin(angle) * grav;
              pointA.posX -= gravX;
              pointA.posY -= gravY;
              pointB.posX += gravX;
              pointB.posY += gravY;

            } else {
              // apply pulling force on all particles not close together
              let grav = distRatio ** 2 * this.options.gravity.pulling,
                  gravX = Math.cos(angle) * grav,
                  gravY = Math.sin(angle) * grav;
              pointA.posX += gravX;
              pointA.posY += gravY;
              pointB.posX -= gravX;
              pointB.posY -= gravY;
            }
          }
        }
      }

      for (let point of this.particles) {
        point.dir = (point.dir + Math.random() * .04 - .02) % (2 * Math.PI);
        point.posX = (point.posX + Math.sin(point.dir) * point.vel % this.width + this.width) % this.width;
        point.posY = (point.posY + Math.cos(point.dir) * point.vel % this.height + this.height) % this.height;

        let offX = point.posX + this.offX - this.mouseX,
            offY = point.posY + this.offY - this.mouseY,
            distRatio = this.options.connectDistance / Math.hypot(offX, offY) * 2 / 3;

        if (distRatio > 2 / 3) {
          point.offX += (distRatio * offX - offX - point.offX) / 4;
          point.offY += (distRatio * offY - offY - point.offY) / 4;

        } else {
          point.offX -= point.offX / 4;
          point.offY -= point.offY / 4;
        }
        point.x = point.posX + point.offX + this.offX;
        point.y = point.posY + point.offY + this.offY;

        if (this.options.interact) {
          // Make the mouse actually move the particles their position instead of just visually
          point.posX = point.x - this.offX;
          point.posY = point.y - this.offY;
        }
      }
    }

    render = function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = this.options.particleColor;
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = "round";

      for (let point of this.particles) {
        if (this.isIn(point)) {
          // Draw pixels
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.closePath();

          // Draw squares
          //this.ctx.fillRect(point.x - point.size, point.y - point.size, point.size * 2, point.size * 2);
        }
      }

      for (let i = 0; i < this.len; i++) {
        for (let j = i + 1; j < this.len; j++) {
          let pointA = this.particles[i],
              pointB = this.particles[j];

          if (this.isIn(pointA) || this.isIn(pointB)) {
            // Draw lines between the visual positions of the particles
            let dist = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);

            if (dist < this.options.connectDistance) {
              this.ctx.strokeStyle = this.options.particleColor +
                Math.floor(Math.min(this.options.connectDistance / dist - 1, 1) * 255)
                .toString(16)
                .padStart(2, 0);
              this.ctx.beginPath();
              this.ctx.moveTo(pointA.x, pointA.y);
              this.ctx.lineTo(pointB.x, pointB.y);
              this.ctx.stroke();
            }
          }
        }
      }
    }

    isIn = function(point) {
      return !(
          point.posX < Math.abs(this.offX) ||
          point.posX > this.width - Math.abs(this.offX) ||
          point.posY < Math.abs(this.offY) ||
          point.posY > this.height - Math.abs(this.offY)
      );
    }

    animation = function() {
      requestAnimationFrame(() => this.animation());

      if (++this.count >= 1) {
        this.count = 0;
        this.update();
        this.render();
      }
    }
  }(selector, options);
}
