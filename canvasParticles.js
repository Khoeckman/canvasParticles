// (C) 2022, Kyle Hoeckman, All rights reserved

"use strict";

const Particles = function(selector, options = {}) {
  class Particles {
    constructor(selector, options = {}) {
      if (document.querySelector(selector) != null) {
        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext("2d");

        window.onresize = () => {
          this.resizeCanvas();
          this.newParticles();
        }

        window.onmousemove = e => {
          this.mouseX = e.clientX - this.rect.left + window.pageXOffset;
          this.mouseY = e.clientY - this.rect.top + window.pageYOffset;
        }

        this.options = {
          background: options.background ?? "#000",
          particleColor: options.particleColor ?? "#fff",
          pixelsPerParticle: options.pixelsPerParticle ?? 10000,
          connectDistance: options.connectDistance ?? 125,
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
      }
    }

    resizeCanvas = function() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.rect = this.canvas.getBoundingClientRect();

      this.mouseX = -Infinity;
      this.mouseY = -Infinity;
    }

    newParticles = function() {
      this.count = Infinity;
      this.width = this.canvas.width + this.options.connectDistance * 2;
      this.height = this.canvas.height + this.options.connectDistance * 2;
      this.off_x = (this.canvas.width - this.width) / 2;
      this.off_y = (this.canvas.height - this.height) / 2;
      this.particles = [];

      for (let i = 0, len = Math.floor(this.width * this.height / this.options.pixelsPerParticle); i < len; i++) {
        let pos_x = Math.random() * this.width,
            pos_y = Math.random() * this.height;

        this.createParticle(pos_x, pos_y);
      }
      this.len = this.particles.length;
    }

    createParticle = function(pos_x, pos_y, dir, vel, size) {
      var pos_x = pos_x - this.off_x || Math.random() * this.width,
          pos_y = pos_y - this.off_y || Math.random() * this.height,
          dir = dir || Math.random() * 2 * Math.PI,
          vel = vel || .5 + Math.random() * .5,
          size = size || .5 + Math.random() ** 5 * 2;

      this.particles.push({
        x: pos_x,
        y: pos_y,
        pos_x,
        pos_y,
        off_x: 0,
        off_y: 0,
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
                dist = Math.hypot(a.pos_x - b.pos_x, a.pos_y - b.pos_y),
                dist_ratio = this.options.connectDistance / Math.max(dist, this.options.connectDistance / 20),
                angle = Math.atan2(b.pos_y - a.pos_y, b.pos_x - a.pos_x);

            if (dist < this.options.connectDistance / .5) {
              // apply repulsive force on all particles close together
              a.pos_x += Math.cos(angle) * dist_ratio ** 2 * -this.options.gravity.repulsive;
              a.pos_y += Math.sin(angle) * dist_ratio ** 2 * -this.options.gravity.repulsive;

              b.pos_x += Math.cos(angle) * dist_ratio ** 2 * this.options.gravity.repulsive;
              b.pos_y += Math.sin(angle) * dist_ratio ** 2 * this.options.gravity.repulsive;

            } else {
              // apply pulling force on all particles not close together
              a.pos_x += Math.cos(angle) * dist_ratio ** 2 * this.options.gravity.pulling;
              a.pos_y += Math.sin(angle) * dist_ratio ** 2 * this.options.gravity.pulling;

              b.pos_x += Math.cos(angle) * dist_ratio ** 2 * -this.options.gravity.pulling;
              b.pos_y += Math.sin(angle) * dist_ratio ** 2 * -this.options.gravity.pulling;
            }
          }
        }
      }

      for (let p of this.particles) {
        p.dir = (p.dir + Math.random() * .04 - .02) % (2 * Math.PI);
        p.pos_x = (p.pos_x + Math.sin(p.dir) * p.vel % this.width + this.width) % this.width;
        p.pos_y = (p.pos_y + Math.cos(p.dir) * p.vel % this.height + this.height) % this.height;

        let off_x = p.pos_x + this.off_x - this.mouseX,
            off_y = p.pos_y + this.off_y - this.mouseY,
            dist_ratio = this.options.connectDistance / Math.hypot(off_x, off_y) * 2 / 3;

        if (dist_ratio > 2 / 3) {
          p.off_x += (dist_ratio * off_x - off_x - p.off_x) / 4;
          p.off_y += (dist_ratio * off_y - off_y - p.off_y) / 4;

        } else {
          p.off_x -= p.off_x / 4;
          p.off_y -= p.off_y / 4;
        }
        p.x = p.pos_x + p.off_x + this.off_x;
        p.y = p.pos_y + p.off_y + this.off_y;

        // Make the mouse actually move the particles their position instead of just visually
        //p.pos_x = p.x - this.off_x;
        //p.pos_y = p.y - this.off_y;
      }
    }

    render = function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = this.options.particleColor;
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = "round";

      for (let p of this.particles) {
        if (this.isInbounds(p)) {
          if (true) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

          } else this.ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
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

            // Draws lines between the real positions of the particles
            /*let dist = Math.hypot(a.pos_x - b.pos_x, a.pos_y - b.pos_y)

            if (dist < this.options.connectDistance) {
              this.ctx.strokeStyle = this.options.particleColor + (~~(Math.min(this.options.connectDistance / dist - 1, 1) * 255)).toString(16).padStart(2, 0);
              this.ctx.beginPath();
              this.ctx.moveTo(a.x, a.y);
              this.ctx.lineTo(b.x, b.y);
              this.ctx.stroke();
            }*/
          }
        }
      }
    }

    isInbounds = function(p) {
      return !(
          p.pos_x < Math.abs(this.off_x) ||
          p.pos_x > this.width - Math.abs(this.off_x) ||
          p.pos_y < Math.abs(this.off_y) ||
          p.pos_y > this.height - Math.abs(this.off_y)
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