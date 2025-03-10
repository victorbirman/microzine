//==========initialize variables and DOM elements

const MAX_PAGES = 8
const DPI = 150
const CANVAS_DIMENSION = { width: 2.91, height: 4.13 } // A7 page in inches
let pagesOrder = [0, 1, 2, 3, 4, 5, 6, 7]

const boundingBox = true
const boundingBoxColor = "#d3d3d3"
const boundingBoxWidth = 1 //in pixels
const boundingBoxLineStyle = "dashed" // Options: "solid", "dashed", "dotted"

const elements = {}
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

renderButton.addEventListener("click", async () => {
  try {
    const { render } = await import("./renderVertical.js")
    render(zine.slotsList, pagesOrder)
  } catch (error) {
    console.error("Error importing or calling render:", error)
  }
})

//============classes
class Page {
  constructor(image, id) {
    this.id = id
    this.image = image
    this.scale = 1
    this.rotation = 0

    const aspectRatio = Math.max(
      this.image.width / (CANVAS_DIMENSION.width * DPI),
      this.image.height / (CANVAS_DIMENSION.height * DPI)
    )
    this.initialWidth = this.image.width / aspectRatio
    this.initialHeight = this.image.height / aspectRatio

    this.container = document.createElement("div")
    this.container.id = `page-container-${this.id}`

    this.createCanvas()
    this.createToolbox()

    this.container.appendChild(this.canvas)
    this.container.appendChild(this.toolsContainer)

    this.setupEventListeners()

    this.drawImage()
  }

  createCanvas() {
    this.canvas = document.createElement("canvas")
    this.canvas.className = "canvas"
    this.canvas.id = `canvas-${this.id}`
    this.canvas.width = Math.round(CANVAS_DIMENSION.width * DPI)
    this.canvas.height = Math.round(CANVAS_DIMENSION.height * DPI)
  }

  createToolbox() {
    this.toolsContainer = document.createElement("div")
    this.toolsContainer.className = "tools-container"

    this.deleteBtn = document.createElement("button")
    this.toolsContainer.appendChild(this.deleteBtn)
    this.deleteBtn.textContent = "🗑️"

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

      this.toolsContainer.appendChild(sliderLabel)
      this.toolsContainer.appendChild(slider)

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

    this.deleteBtn.addEventListener("click", () => this.removePage())
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

    if (boundingBox) {
      ctx.strokeStyle = boundingBoxColor
      ctx.lineWidth = boundingBoxWidth

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

      ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)

      ctx.setLineDash([])
    }
  }
  removePage() {
    this.canvas.width = 0
    this.canvas.height = 0
    this.container.remove()

    if (this.image.src.startsWith("blob:")) {
      URL.revokeObjectURL(this.image.src)
    }

    this.rotationSlider.replaceWith(this.rotationSlider.cloneNode(true))
    this.scaleSlider.replaceWith(this.scaleSlider.cloneNode(true))
    this.deleteBtn.replaceWith(this.deleteBtn.cloneNode(true))

    zine.slotsList[this.id] = null
  }
}

class SlotList {
  constructor(numberOfPages) {
    this.slotsList = new Array(numberOfPages).fill(null)
  }
  get length() {
    return this.slotsList.length
  }
  get emptySlotsCount() {
    return this.slotsList.filter(slot => slot == null).length
  }
  get nextEmptySlot() {
    return this.slotsList.findIndex(x => x == null)
  }
}

new Sortable(elements.pagesContainer, {
  animation: 150,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  handle: "canvas",
  onEnd: function () {
    pagesOrder = Array.from(pagesContainer.children).map(item =>
      parseInt(item.id.replace("slot-", ""))
    )
  },
})

let zine = new SlotList(MAX_PAGES)
function importImages(files) {
  if (zine.emptySlotsCount <= 0) {
    fullSlotsWarning()
    return
  }
  const filesToAdd = Array.from(files)
    .filter(file => file.type.startsWith("image/"))
    .slice(0, zine.emptySlotsCount)

  filesToAdd.forEach(file => {
    const img = new Image()
    const objectURL = URL.createObjectURL(file)
    img.src = objectURL

    img.onload = function () {
      const page = new Page(img, zine.nextEmptySlot)
      zine.slotsList[page.id] = page
      document.getElementById(`slot-${page.id}`).appendChild(page.container)
      URL.revokeObjectURL(objectURL)
    }
    img.onerror = function () {
      console.error("Failed to load image")
      URL.revokeObjectURL(objectURL)
    }
  })
}

function fullSlotsWarning() {
  console.log("llegaste al límite de imágenes")
}
