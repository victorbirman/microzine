import { Page } from "./Page.js"

//==========Initialize Fanzine Layout
const layout = {
  maxPages: 8,
  dpi: 150,
  pageInches: { width: 2.91, height: 4.13 }, // A7 page
  pagesOrder: [0, 1, 2, 3, 4, 5, 6, 7], // Sortable initialization
}

const foldingGuides = {
  active: true,
  color: "#d3d3d3",
  width: 1, //in pixels
  style: "dashed", // Options: "solid", "dashed", "dotted"
}

//=========== Initialize Slots
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
export let zine = new SlotList(layout.maxPages)

//========== Initialize Sortable
let sortable = new Sortable(document.getElementById("pagesContainer"), {
  animation: 150,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  onEnd: function () {
    layout.pagesOrder = Array.from(pagesContainer.children).map(item =>
      parseInt(item.id.replace("slot-", ""))
    )
  },
})

//========== Initialize Upload Area
const dropArea = document.getElementById("dropArea")
const uploadBtn = document.getElementById("uploadBtn")
const fileInput = document.getElementById("fileInput")

uploadBtn.addEventListener("click", () => {
  fileInput.click()
})

fileInput.addEventListener("change", e => {
  importImages(e.target.files)
  e.target.value = "" // Clear input to allow same file re-upload
})

dropArea.addEventListener("drop", e => {
  e.preventDefault()
  dropArea.classList.remove("dragover")
  importImages(e.dataTransfer.files)
})

dropArea.addEventListener("dragover", e => {
  e.preventDefault()
  dropArea.classList.add("dragover")
})

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover")
})

//======== Set Current Canvas on Mouseover
let currentSlot = null
let currentCanvas
let slots = document.querySelectorAll(".slot")

//======== Transform Tools Rendering and Status

let toolStatus = "reorder"

const statusMapping = {
  reorderBtn: "reorder",
  rotateBtn: "rotate",
  scaleBtn: "scale",
  moveBtn: "move",
}

const buttons = document.querySelectorAll(".controls button")

function updateButtonStyles(activeBtnId) {
  buttons.forEach(btn => {
    if (btn.id === activeBtnId) {
      btn.style.color = "blue"
    } else {
      btn.style.color = "black"
    }
  })
}

function activateButton(btnId) {
  toolStatus = statusMapping[btnId]
  updateButtonStyles(btnId)
  sortable.options.disabled = true
}

function activateReorder() {
  toolStatus = "reorder"
  updateButtonStyles("reorderBtn")
  sortable.options.disabled = false
}

buttons.forEach(btn => {
  btn.addEventListener("click", function () {
    const clickedStatus = statusMapping[btn.id]

    if (clickedStatus === "reorder") {
      activateReorder()
      return
    }
    if (toolStatus === clickedStatus) {
      activateReorder()
      return
    }
    activateButton(btn.id)
  })
})

//========= Active Canvas Status
slots.forEach(slot =>
  slot.addEventListener("mouseenter", e => {
    // Only update current canvas if not dragging
    if (!isDragging) {
      currentSlot = e.target
      currentCanvas = zine.slotsList[parseInt(currentSlot.id.replace("slot-", ""))]
    }
  })
)

slots.forEach(slot =>
  slot.addEventListener("mouseleave", e => {
    currentSlot = null
  })
)

//====== Mouse Events For Transformation Tools

let isDragging = false
let lastX, lastY

const rotationFactor = 0.5
const scaleFactor = 0.01

function handleMouseDown(e) {
  if (toolStatus === "reorder" || !currentSlot || !currentCanvas) return
  isDragging = true
  lastX = e.clientX
  lastY = e.clientY
}

function handleMouseMove(e) {
  if (!isDragging || !currentCanvas) return

  let deltaX = e.clientX - lastX
  let deltaY = e.clientY - lastY

  switch (toolStatus) {
    case "rotate":
      currentCanvas.rotateBy(deltaX * rotationFactor)
      break
    case "scale":
      currentCanvas.scaleBy(deltaX * scaleFactor)
      break
    case "move":
      currentCanvas.moveBy(deltaX, deltaY)
      break
  }

  lastX = e.clientX
  lastY = e.clientY
}

function handleMouseUp(e) {
  isDragging = false
}

document.addEventListener("mousedown", handleMouseDown)
document.addEventListener("mousemove", handleMouseMove)
document.addEventListener("mouseup", handleMouseUp)

//========= Render Button Calls Render
document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    const { render } = await import("./render.js")
    render(zine.slotsList, layout.pagesOrder, foldingGuides)
  } catch (error) {
    console.error("Error importing or calling render:", error)
  }
})

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
      const page = new Page(img, zine.nextEmptySlot, layout)
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
  console.log("llegaste al límite de imágenes") //may will add something useful here
}
