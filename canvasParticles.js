// Copyright (c) 2022 Kyle Hoeckman
// https://github.com/Khoeckman/canvasParticles/blob/main/LICENSE

"use strict";

const Particles = function(selector, options = {}) {
  class Particles {
    constructor(selector, options = {}) {
      if (document.querySelector(selector) != null) {
        var particles = this;
        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext("2d");

        this.options = {
          background: options.background ?? "#000",
          particleColor: options.particleColor ?? "#fff",
          pixelsPerParticle: options.pixelsPerParticle ?? 10000,
          connectDistance: options.connectDistance ?? 125,
          interact: options.interact ?? false,
          gravity: {
            enabled: options.gravity?.enabled ?? false,
            repulsive: options.gravity?.repulsive ?? 0,
            pulling: options.gravity?.pulling ?? 0
          }
        }
        this.canvas.style.background = this.options.background ?? "#000";

        this.resizeCanvas();
        this.newParticles();
        requestAnimationFrame(() => this.animation());

        window.addEventListener("resize", function(e) {
          particles.resizeCanvas();
          particles.newParticles();
        });

        window.addEventListener("mousemove", function(e) {
          particles.mouseX = e.clientX - particles.canvas.offsetLeft + this.pageXOffset;
          particles.mouseY = e.clientY - particles.canvas.offsetTop + this.pageYOffset;
        });
      }
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
      var posX = posX - this.offX || Math.random() * this.width,
          posY = posY - this.offY || Math.random() * this.height,
          dir = dir || Math.random() * 2 * Math.PI,
          vel = vel || .5 + Math.random() * .5,
          size = size || .5 + Math.random() ** 5 * 2;

      this.particles.push({
        x: posX,
        y: posY,
        posX,
        posY,
        offX: 0,
        offY: 0,
        dir,
        vel,
        size
      });
    }

    update = function() {
      if (this.options.gravity?.enabled) {
        for (let i = 0; i < this.len; i++) {
          for (let j = i + 1; j < this.len; j++) {
            let a = this.particles[i],
                b = this.particles[j],
                dist = Math.hypot(a.posX - b.posX, a.posY - b.posY),
                distRatio = this.options.connectDistance / Math.max(dist, this.options.connectDistance / 20),
                angle = Math.atan2(b.posY - a.posY, b.posX - a.posX);

            if (dist < this.options.connectDistance / .5) {
              // apply repulsive force on all particles close together
              a.posX += Math.cos(angle) * distRatio ** 2 * -this.options.gravity.repulsive;
              a.posY += Math.sin(angle) * distRatio ** 2 * -this.options.gravity.repulsive;

              b.posX += Math.cos(angle) * distRatio ** 2 * this.options.gravity.repulsive;
              b.posY += Math.sin(angle) * distRatio ** 2 * this.options.gravity.repulsive;

            } else {
              // apply pulling force on all particles not close together
              a.posX += Math.cos(angle) * distRatio ** 2 * this.options.gravity.pulling;
              a.posY += Math.sin(angle) * distRatio ** 2 * this.options.gravity.pulling;

              b.posX += Math.cos(angle) * distRatio ** 2 * -this.options.gravity.pulling;
              b.posY += Math.sin(angle) * distRatio ** 2 * -this.options.gravity.pulling;
            }
          }
        }
      }

      for (let p of this.particles) {
        p.dir = (p.dir + Math.random() * .04 - .02) % (2 * Math.PI);
        p.posX = (p.posX + Math.sin(p.dir) * p.vel % this.width + this.width) % this.width;
        p.posY = (p.posY + Math.cos(p.dir) * p.vel % this.height + this.height) % this.height;

        let offX = p.posX + this.offX - this.mouseX,
            offY = p.posY + this.offY - this.mouseY,
            distRatio = this.options.connectDistance / Math.hypot(offX, offY) * 2 / 3;

        if (distRatio > 2 / 3) {
          p.offX += (distRatio * offX - offX - p.offX) / 4;
          p.offY += (distRatio * offY - offY - p.offY) / 4;

        } else {
          p.offX -= p.offX / 4;
          p.offY -= p.offY / 4;
        }
        p.x = p.posX + p.offX + this.offX;
        p.y = p.posY + p.offY + this.offY;

        if (this.options.interact) {
          // Make the mouse actually move the particles their position instead of just visually
          p.posX = p.x - this.offX;
          p.posY = p.y - this.offY;
        }
      }
    }

    render = function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = this.options.particleColor;
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = "round";

      for (let p of this.particles) {
        if (this.isInbounds(p)) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.closePath();

          // Draw squares instead of circles
          //this.ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        }
      }

      for (let i = 0; i < this.len; i++) {
        for (let j = i + 1; j < this.len; j++) {
          let a = this.particles[i],
              b = this.particles[j];

          if (this.isInbounds(a) || this.isInbounds(b)) {
            // Draw lines between the visual positions of the particles
            let dist = Math.hypot(a.x - b.x, a.y - b.y);

            if (dist < this.options.connectDistance) {
              this.ctx.strokeStyle = this.options.particleColor + (~~(Math.min(this.options.connectDistance / dist - 1, 1) * 255)).toString(16).padStart(2, 0);
              this.ctx.beginPath();
              this.ctx.moveTo(a.x, a.y);
              this.ctx.lineTo(b.x, b.y);
              this.ctx.stroke();
            }
          }
        }
      }
    }

    isInbounds = function(p) {
      return !(
          p.posX < Math.abs(this.offX) ||
          p.posX > this.width - Math.abs(this.offX) ||
          p.posY < Math.abs(this.offY) ||
          p.posY > this.height - Math.abs(this.offY)
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
  }
  return new Particles(selector, options);
}
