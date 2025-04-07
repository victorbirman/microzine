import { zine } from "./script.js"

export class Page {
  constructor(image, id, layout) {
    this.id = id
    this.image = image
    this.scale = 1
    this.rotation = 0
    this.offsetX = 0
    this.offsetY = 0
    this.pagePixels = {
      width: layout.pageInches.width * layout.dpi,
      height: layout.pageInches.height * layout.dpi,
    }
    const aspectRatio = Math.max(
      this.image.width / this.pagePixels.width,
      this.image.height / this.pagePixels.height
    )
    this.initialWidth = this.image.width / aspectRatio
    this.initialHeight = this.image.height / aspectRatio

    this.container = document.createElement("div")
    this.container.id = `page-container-${this.id}`

    this.createCanvas()
    this.container.appendChild(this.canvas)

    this.deleteListener = () => this.removeImage()
    this.resetListener = () => this.resetImage()
    this.createToolbox()
    this.container.appendChild(this.toolsContainer)

    this.drawImage()
  }

  createCanvas() {
    this.canvas = document.createElement("canvas")
    this.canvas.className = "canvas"
    this.canvas.id = `canvas-${this.id}`
    this.canvas.width = Math.round(this.pagePixels.width)
    this.canvas.height = Math.round(this.pagePixels.height)
  }

  createToolbox() {
    this.toolsContainer = document.createElement("div")
    this.toolsContainer.className = "tools-container"

    this.deleteBtn = document.createElement("button")
    this.toolsContainer.appendChild(this.deleteBtn)
    this.deleteBtn.textContent = "🗑️"
    this.deleteBtn.addEventListener("click", this.deleteListener)

    this.resetBtn = document.createElement("button")
    this.toolsContainer.appendChild(this.resetBtn)
    this.resetBtn.textContent = "🔄"
    this.resetBtn.addEventListener("click", this.resetListener)
  }

  drawImage() {
    const ctx = this.canvas.getContext("2d")
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.imageSmoothingEnabled = true // Enable smoothing
    ctx.imageSmoothingQuality = "high" // Set quality level

    const scaledWidth = this.initialWidth * this.scale
    const scaledHeight = this.initialHeight * this.scale

    ctx.save()
    // Translate to canvas center plus any drag offset
    ctx.translate(
      this.canvas.width / 2 + this.offsetX,
      this.canvas.height / 2 + this.offsetY
    )
    ctx.rotate((this.rotation * Math.PI) / 180)
    ctx.drawImage(
      this.image,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    )
    ctx.restore()
  }

  rotateBy(deltaAngle) {
    this.rotation += deltaAngle
    this.drawImage()
  }

  scaleBy(deltaScale) {
    const newScale = this.scale + deltaScale
    this.scale = newScale > 0.1 ? newScale : 0.1
    this.drawImage()
  }

  moveBy(deltaX, deltaY) {
    this.offsetX += deltaX
    this.offsetY += deltaY
    this.drawImage()
  }

  removeImage() {
    this.deleteBtn.removeEventListener("click", this.deleteListener)
    this.resetBtn.removeEventListener("click", this.resetListener)

    this.canvas.width = 0
    this.canvas.height = 0
    this.container.remove()

    if (this.image.src.startsWith("blob:")) {
      URL.revokeObjectURL(this.image.src)
    }

    zine.slotsList[this.id] = null
  }

  resetImage() {
    this.scale = 1
    this.rotation = 0
    // Reset the drag offset too
    this.offsetX = 0
    this.offsetY = 0
    this.drawImage()
  }
}
