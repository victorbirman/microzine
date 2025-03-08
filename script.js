//==========initialize variables and DOM elements

const MAX_PAGES = 8
const DPI = 150
const CANVAS_DIMENSION = { width: 2.91, height: 4.13 } // A7 page in inches
const pages = []
const elements = {}
let pagesOrder = [0, 1, 2, 3, 4, 5, 6, 7]

const boundingBox = true
const boundingBoxColor = "#d3d3d3"
const boundingBoxWidth = 1 //in pixels
const boundingBoxLineStyle = "dashed" // Options: "solid", "dashed", "dotted"
;[
  "uploadBox",
  "uploadButton",
  "fileInput",
  "pagesContainer",
  "renderButton",
].forEach(id => (elements[id] = document.getElementById(id)))

//==========event listeners for upload-box

uploadButton.addEventListener("click", () => fileInput.click())
fileInput.addEventListener("change", e => {
  importImages(e.target.files)
  e.target.value = ""
})
uploadBox.addEventListener("drop", e => {
  e.preventDefault()
  uploadBox.classList.remove("dragover")
  importImages(e.dataTransfer.files)
})
uploadBox.addEventListener("dragover", el => {
  el.preventDefault()
  uploadBox.classList.add("dragover")
})
uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"))

//==========render calls render module

renderButton.addEventListener("click", async () => {
  try {
    const { render } = await import("./renderVertical.js")
    render(pages, pagesOrder)
  } catch (error) {
    console.error("Error importing or calling render:", error)
  }
})

//==========initialize sortable library and refresh order of pages

new Sortable(elements.pagesContainer, {
  animation: 150,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  handle: "canvas",
  onEnd: function (evt) {
    pagesOrder = Array.from(pagesContainer.children).map(item =>
      parseInt(item.id.replace("slot-", ""))
    )
    console.log("Full order of items:", pagesOrder)
  },
})

//==========uploaded images call page creation and are attached to container

function importImages(files) {
  const remainingSlots = MAX_PAGES - pages.filter(x => x !== null).length
  const filesToAdd = Array.from(files)
    .filter(file => file.type.startsWith("image/"))
    .slice(0, remainingSlots)

  filesToAdd.forEach(file => {
    const img = new Image()
    const objectURL = URL.createObjectURL(file)
    img.src = objectURL

    img.onload = function () {
      const page = new Page(img)
      pages[page.id] = page
      document.getElementById(`slot-${page.id}`).appendChild(page.container)
      URL.revokeObjectURL(objectURL)
    }
    img.onerror = function () {
      console.error("Failed to load image")
      URL.revokeObjectURL(objectURL)
    }
  })
}

//==========page includes canvas and sliders, methods for drawing an manipulation

class Page {
  static id = 0

  constructor(image) {
    this.image = image
    this.scale = 1
    this.rotation = 0

    this.id = Page.id

    const aspectRatio = Math.max(
      this.image.width / (CANVAS_DIMENSION.width * DPI),
      this.image.height / (CANVAS_DIMENSION.height * DPI)
    )
    this.initialWidth = this.image.width / aspectRatio
    this.initialHeight = this.image.height / aspectRatio

    this.container = document.createElement("div")
    this.container.id = `page-container-${this.id}`

    this.createCanvas()
    this.createSliders()

    this.container.appendChild(this.canvas)
    this.container.appendChild(this.sliderContainer)

    this.setupEventListeners()

    this.drawImage()
    Page.id++
  }

  createCanvas() {
    this.canvas = document.createElement("canvas")
    this.canvas.className = "canvas"
    this.canvas.id = `canvas-${this.id}`
    this.canvas.width = Math.round(CANVAS_DIMENSION.width * DPI)
    this.canvas.height = Math.round(CANVAS_DIMENSION.height * DPI)
  }

  createSliders() {
    this.sliderContainer = document.createElement("div")
    this.sliderContainer.className = "slider-container"

    const sliders = [
      {
        label: "Rotation",
        id: `rotation-slider-${this.id}`,
        min: -180,
        max: 180,
        value: 0,
        step: 1,
      },
      {
        label: "Scale (%)",
        id: `scale-slider-${this.id}`,
        min: 1,
        max: 200,
        value: 100,
        step: 1,
      },
    ]

    sliders.forEach(({ label, id, min, max, value, step }) => {
      const sliderLabel = document.createElement("label")
      sliderLabel.setAttribute("for", id)
      sliderLabel.textContent = `${label}:`

      const slider = document.createElement("input")
      slider.type = "range"
      slider.id = id
      slider.className = `${label.toLowerCase().split(" ")[0]}-slider`
      slider.min = min
      slider.max = max
      slider.value = value
      slider.step = step

      this.sliderContainer.appendChild(sliderLabel)
      this.sliderContainer.appendChild(slider)

      if (label === "Rotation") this.rotationSlider = slider
      if (label === "Scale (%)") this.scaleSlider = slider
    })
  }

  setupEventListeners() {
    this.rotationSlider.addEventListener("input", () => {
      this.rotation = parseInt(this.rotationSlider.value, 10)
      this.drawImage()
    })

    this.scaleSlider.addEventListener("input", () => {
      this.scale = parseInt(this.scaleSlider.value, 10) / 100
      this.drawImage()
    })
  }

  drawImage() {
    const ctx = this.canvas.getContext("2d")
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const scaledWidth = this.initialWidth * this.scale
    const scaledHeight = this.initialHeight * this.scale

    ctx.save()
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    ctx.rotate((this.rotation * Math.PI) / 180)
    ctx.drawImage(
      this.image,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    )
    ctx.restore()

    // Draw the bounding box if enabled
    if (boundingBox) {
      ctx.strokeStyle = boundingBoxColor
      ctx.lineWidth = boundingBoxWidth

      // Set line style based on boundingBoxLineStyle
      switch (boundingBoxLineStyle) {
        case "dashed":
          ctx.setLineDash([10, 5]) // Dash pattern: 10px drawn, 5px gap
          break
        case "dotted":
          ctx.setLineDash([2, 4]) // Dot pattern: 2px drawn, 4px gap
          break
        default:
          ctx.setLineDash([]) // Solid line (no dashes)
          break
      }

      // Draw the bounding box
      ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)

      // Reset the line dash to avoid affecting other drawings
      ctx.setLineDash([])
    }
  }
}
