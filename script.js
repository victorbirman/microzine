import { SlotList } from "./SlotList.js"
import { sortable } from "./sortable.js"
import initializeUploadArea from "./uploadArea.js"

export const layout = {
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

export let zine = new SlotList(layout.maxPages)

initializeUploadArea()

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

//========= Render Button
document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    const { render } = await import("./render.js")
    render(zine.slotsList, layout.pagesOrder, foldingGuides)
  } catch (error) {
    console.error("Error importing or calling render:", error)
  }
})
