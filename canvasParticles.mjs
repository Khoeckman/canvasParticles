// Copyright (c) 2022 - 2024 Kyle Hoeckman, MIT License
// https://github.com/Khoeckman/canvasParticles/blob/main/LICENSE

/**
 * In an HTML canvas, a bunch of floating particles are drawn that connect with a line when they are close to eachother.
 * Creating a smooth, interactive background by simply placing a canvas over the background.
 * Colors, interaction, gravity and other complex settings can be customized!
 *
 * @module CanvasParticles
 * @version 3.1.5
 */
export default class CanvasParticles {
  animating = false

  /**
   * Creates a new CanvasParticles instance.
   * @param {string} [selector='canvas'] - The CSS selector for the canvas element. Defaults to 'canvas'.
   * @param {Object} [options={}] - Object structure: https://github.com/Khoeckman/canvasParticles?tab=readme-ov-file#options
   */
  constructor(selector = 'canvas', options = {}) {
    // Find and initialize canvas
    if (typeof selector !== 'string') throw new TypeError('selector is not a string')

    this.canvas = document.querySelector(selector)
    if (!(this.canvas instanceof HTMLCanvasElement)) throw new ReferenceError('selector does not point to a canvas')

    // Get 2d drawing functions
    this.ctx = this.canvas.getContext('2d')

    // Format and store options
    this.options = {
      background: options.background ?? false,
      framesPerUpdate: Math.max(1, parseInt(options.framesPerUpdate) ?? 1),
      resetOnResize: !!(options.resetOnResize ?? true),
      mouse: {
        interactionType: +(parseInt(options.mouse?.interactionType) ?? 1),
        connectDistMult: +(options.mouse?.connectDistMult ?? 2 / 3),
        distRatio: +(options.mouse?.distRatio ?? 2 / 3),
      },
      particles: {
        color: options.particles?.color ?? 'black',
        ppm: +(options.particles?.ppm ?? 100),
        max: +(options.particles?.max ?? 500),
        maxWork: Math.max(0, options.particles?.maxWork ?? Infinity),
        connectDist: Math.max(1, options.particles?.connectDistance ?? 150),
        relSpeed: Math.max(0, options.particles?.relSpeed ?? 1),
        rotationSpeed: Math.max(0, (options.particles?.rotationSpeed ?? 2) / 100),
      },
      gravity: {
        repulsive: +(options.gravity?.repulsive ?? 0),
        pulling: +(options.gravity?.pulling ?? 0),
        friction: Math.max(0, options.particles?.friction ?? 0.8),
      },
    }

    // Use default value if number could not be formatted
    if (isNaN(this.options.framesPerUpdate)) this.options.framesPerUpdate = 1

    if (isNaN(this.options.mouse.interactionType)) this.options.mouse.interactionType = 1
    if (isNaN(this.options.mouse.connectDistMult)) this.options.mouse.connectDistMult = 2 / 3
    if (isNaN(this.options.mouse.distRatio)) this.options.mouse.distRatio = 2 / 3

    if (isNaN(this.options.particles.ppm)) this.options.particles.ppm = 100
    if (isNaN(this.options.particles.max)) this.options.particles.max = 500
    if (isNaN(this.options.particles.maxWork)) this.options.particles.maxWork = Infinity
    if (isNaN(this.options.particles.connectDist)) this.options.particles.connectDist = 150
    if (isNaN(this.options.particles.relSpeed)) this.options.particles.relSpeed = 1
    if (isNaN(this.options.particles.rotationSpeed)) this.options.particles.rotationSpeed = 0.02

    if (isNaN(this.options.gravity.repulsive)) this.options.gravity.repulsive = 0
    if (isNaN(this.options.gravity.pulling)) this.options.gravity.pulling = 0
    if (isNaN(this.options.gravity.friction)) this.options.gravity.friction = 0.9

    // Transform distance multiplier to absolute distance
    this.options.mouse.connectDist = this.options.particles.connectDist * this.options.mouse.connectDistMult
    delete this.options.mouse.connectDistMult

    // Format particle color and opacity
    this.ctx.fillStyle = this.options.particles.color

    if (this.ctx.fillStyle[0] === '#') {
      this.options.particles.opacity = { value: 1, hex: 'ff' }
      this.options.particles.color = this.ctx.fillStyle
    } else {
      // Example: extract 0.25 from rgba(136, 244, 255, 0.25) and convert to range 0x00 to 0xff and store as a 2 char string
      let value = ~~(this.ctx.fillStyle.split(',').at(-1).slice(1, -1) * 255)
      this.options.particles.opacity = {
        value: value / 255,
        hex: value.toString(16),
      }

      // Example: extract 136, 244 and 255 from rgba(136, 244, 255, 0.25) and convert to '#001122' format
      this.ctx.fillStyle = this.ctx.fillStyle.split(',').slice(0, -1).join(',') + ', 1)'
      this.options.particles.color = this.ctx.fillStyle
    }

    if (typeof this.options.background !== 'string') this.canvas.style.background = this.options.background
    this.resizeCanvas()

    const updateMousePos = event => {
      if (!this.animating) return

      if (event instanceof MouseEvent) {
        this.clientX = event.clientX
        this.clientY = event.clientY
      }
      this.mouseX = this.clientX - this.canvas.offsetLeft + window.scrollX
      this.mouseY = this.clientY - this.canvas.offsetTop + window.scrollY
    }

    window.addEventListener('resize', () => this.resizeCanvas())
    window.addEventListener('mousemove', updateMousePos)
    window.addEventListener('scroll', updateMousePos)
  }

  resizeCanvas = () => {
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight

    this.mouseX = Infinity
    this.mouseY = Infinity

    this.updateCount = Infinity
    this.width = this.canvas.width + this.options.particles.connectDist * 2
    this.height = this.canvas.height + this.options.particles.connectDist * 2
    this.offX = (this.canvas.width - this.width) / 2
    this.offY = (this.canvas.height - this.height) / 2

    // Amount of particles to be created
    const particles = Math.floor((this.options.particles.ppm * this.width * this.height) / 1000000)
    this.len = Math.min(this.options.particles.max, particles)

    if (this.options.resetOnResize || typeof this.particles === 'undefined') this.newParticles()
    else this.matchParticlesAmount()
  }

  /** Remove all particles and generates new ones.
   * The amount of new particles will match 'options.particles.ppm'
   * */
  newParticles = () => {
    if (this.len === Infinity) throw new RangeError('cannot create an infinite amount of particles')
    this.particles = []
    for (let i = 0; i < this.len; i++) this.createParticle()
  }

  /** When resizing, add or remove some particles.
   * The final amount of particles will match 'options.particles.ppm'
   * */
  matchParticlesAmount = () => {
    if (this.len === Infinity) throw new RangeError('cannot create an infinite amount of particles')
    this.particles = this.particles.slice(0, this.len)
    while (this.len > this.particles.length) this.createParticle()
  }

  createParticle = function (posX, posY, dir, speed, size) {
    this.particles.push({
      posX: posX - this.offX || Math.random() * this.width, // Logical position in pixels
      posY: posY - this.offY || Math.random() * this.height, // Logical position in pixels
      x: posX, // Visual position in pixels
      y: posY, // Visual position in pixels
      velX: 0, // Horizonal speed in pixels per update
      velY: 0, // Vertical speed in pixels per update
      offX: 0, // Horizontal distance from drawn to logical position in pixels
      offY: 0, // Vertical distance from drawn to logical position in pixels
      dir: dir || Math.random() * 2 * Math.PI, // Direction in radians
      speed: speed || (0.5 + Math.random() * 0.5) * this.options.particles.relSpeed, // Velocity in pixels per update
      size: size || 0.5 + Math.random() ** 5 * 2, // Ray in pixels of the particle
    })
    let point = this.particles.at(-1)
    point.isVisible = this.isVisible(point) // Whether the particles position is within the bounds of the canvas
  }

  /** Calculates the properties of each particle on the next frame.
   * Is executed once every 'options.framesPerUpdate' frames.
   * */
  update = () => {
    if (this.options.gravity.repulsive !== 0 || this.options.gravity.pulling !== 0) {
      for (let i = 0; i < this.len; i++) {
        for (let j = i + 1; j < this.len; j++) {
          // Code in this scope runs [particles ** 2 / 2] times!
          const pointA = this.particles[i]
          const pointB = this.particles[j]
          const dist = Math.hypot(pointA.posX - pointB.posX, pointA.posY - pointB.posY)
          const angle = Math.atan2(pointB.posY - pointA.posY, pointB.posX - pointA.posX)

          if (dist < this.options.particles.connectDist / 2) {
            // Apply repulsive force on all particles close together
            const grav = (1 / Math.max(dist, 10)) ** 1.8 * this.options.particles.connectDist * this.options.gravity.repulsive
            const gravX = Math.cos(angle) * grav
            const gravY = Math.sin(angle) * grav
            pointA.velX -= gravX
            pointA.velY -= gravY
            pointB.velX += gravX
            pointB.velY += gravY
          } else if (this.options.gravity.pulling !== 0) {
            // Apply pulling force on all particles not close together
            const grav = (1 / Math.max(dist, 10)) ** 1.8 * this.options.particles.connectDist * this.options.gravity.pulling
            const gravX = Math.cos(angle) * grav
            const gravY = Math.sin(angle) * grav
            pointA.velX += gravX
            pointA.velY += gravY
            pointB.velX -= gravX
            pointB.velY -= gravY
          }
        }
      }
    }

    for (let point of this.particles) {
      // I am not explaning this ... have fun
      point.dir =
        (point.dir + Math.random() * this.options.particles.rotationSpeed * 2 - this.options.particles.rotationSpeed) % (2 * Math.PI)
      point.velX *= this.options.gravity.friction
      point.velY *= this.options.gravity.friction
      point.posX = (point.posX + point.velX + ((Math.sin(point.dir) * point.speed) % this.width) + this.width) % this.width
      point.posY = (point.posY + point.velY + ((Math.cos(point.dir) * point.speed) % this.height) + this.height) % this.height

      const distX = point.posX + this.offX - this.mouseX
      const distY = point.posY + this.offY - this.mouseY

      if (this.options.mouse.interactionType !== 0) {
        const distRatio = this.options.mouse.connectDist / Math.hypot(distX, distY)

        if (this.options.mouse.distRatio < distRatio) {
          point.offX += (distRatio * distX - distX - point.offX) / 4
          point.offY += (distRatio * distY - distY - point.offY) / 4
        } else {
          point.offX -= point.offX / 4
          point.offY -= point.offY / 4
        }
      }
      point.x = point.posX + point.offX + this.offX
      point.y = point.posY + point.offY + this.offY

      if (this.options.mouse.interactionType === 2) {
        // Make the mouse actually move the particles their position instead of just visually
        point.posX = point.x - this.offX
        point.posY = point.y - this.offY
      }
      point.isVisible = this.isVisible(point)
    }
  }

  /**
   * Determines if a particle is visible on the canvas.
   * @param {Object} point - The particle to check visibility for.
   * @returns {boolean} - True if the particle is visible, false otherwise.
   */
  isVisible = function (point) {
    return !(
      point.posX < Math.abs(this.offX) ||
      point.posX > this.width - Math.abs(this.offX) ||
      point.posY < Math.abs(this.offY) ||
      point.posY > this.height - Math.abs(this.offY)
    )
  }

  /**
   * Renders the particles and their connections onto the canvas.
   * Connects particles with lines if they are within the connection distance.
   */
  render = () => {
    this.canvas.width = this.canvas.width // Clear canvas
    this.ctx.fillStyle = this.options.particles.color + this.options.particles.opacity.hex
    this.ctx.lineWidth = 1

    for (let point of this.particles) {
      if (point.isVisible) {
        // Draw the particle as a square if the size is smaller than 1 pixel (±183% faster than drawing only circles)
        if (point.size > 1) {
          // Draw circle
          this.ctx.beginPath()
          this.ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI)
          this.ctx.fill()
          this.ctx.closePath()
        } else {
          // Draw square (±335% faster than circle)
          this.ctx.fillRect(point.x - point.size, point.y - point.size, point.size * 2, point.size * 2)
        }
      }
    }

    const drawAll = this.options.particles.connectDist >= Math.min(this.width, this.height)

    const maxWorkPerParticle = this.options.particles.connectDist * this.options.particles.maxWork
    const maxWork = maxWorkPerParticle * this.len
    let work = 0

    for (let i = 0; i < this.len; i++) {
      let particleWork = 0

      for (let j = i + 1; j < this.len; j++) {
        // Code in this scope runs [particles ** 2 / 2] times!
        const pointA = this.particles[i]
        const pointB = this.particles[j]

        // A line should be drawn if at least one point is on screen
        if (pointA.isVisible || pointB.isVisible || drawAll) {
          const dist = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y)

          // Connect the 2 points with a line if the distance is small enough
          if (dist < this.options.particles.connectDist) {
            // Calculate the transparency of the line
            if (dist >= this.options.particles.connectDist / 2) {
              let alpha = Math.floor(
                Math.min(this.options.particles.connectDist / dist - 1, 1) * 255 * this.options.particles.opacity.value
              ).toString(16)
              this.ctx.strokeStyle = this.options.particles.color + (alpha.length === 2 ? alpha : '0' + alpha)
            } else this.ctx.strokeStyle = this.options.particles.color + this.options.particles.opacity.hex

            // Draw the line
            this.ctx.beginPath()
            this.ctx.moveTo(pointA.x, pointA.y)
            this.ctx.lineTo(pointB.x, pointB.y)
            this.ctx.stroke()

            if ((work += dist) >= maxWork || (particleWork += dist) >= maxWorkPerParticle) break
          }
        }
      }
      if (work >= maxWork) break
    }
  }

  /**
   * Main animation loop that updates and renders the particles.
   * Runs recursively using `requestAnimationFrame`.
   */
  animation = () => {
    if (!this.animating) return

    requestAnimationFrame(() => this.animation())

    if (++this.updateCount >= this.options.framesPerUpdate) {
      this.updateCount = 0

      if (window.innerWidth > 960) {
        this.update()
        this.render()
      }
    }
  }

  /**
   * Starts the particle animation.
   * If already animating, does nothing.
   */
  start = () => {
    if (this.animating) return
    this.animating = true
    requestAnimationFrame(() => this.animation())
  }

  /**
   * Stops the particle animation and clears the canvas.
   */
  stop = () => {
    this.animating = false
    this.canvas.width = this.canvas.width
  }
}
