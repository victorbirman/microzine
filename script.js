import { SlotList } from "./SlotList.js"
import { sortable } from "./sortable.js"
import dropArea from "./dropArea.js"

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

export const uploader = dropArea()
uploader.enableDropArea()

let slots = document.querySelectorAll(".slot")
const toolsButtons = document.querySelectorAll(".controls button")
let activeTool = "reorder"

toolsButtons.forEach(btn => {
  btn.addEventListener("click", function () {
    if (btn.id === "reorder" || btn.id === activeTool) {
      activateTool("reorder")
    } else activateTool(btn.id)
  })
})

function activateTool(clickedTool) {
  activeTool = clickedTool
  toolsButtons.forEach(btn => {
    btn.classList.toggle("active", btn.id === activeTool)
  })
  sortable.options.disabled = clickedTool !== "reorder"
  slots.forEach(slot => (slot.dataset.tool = activeTool))
}
let currentSlot = null
let currentCanvas = null
let isDragging = false
let lastX, lastY
const rotationFactor = 0.5
const scaleFactor = 0.01

document.addEventListener("pointerdown", handleMouseDown)
document.addEventListener("pointermove", handleMouseMove)
document.addEventListener("pointerup", handleMouseUp)

function handleMouseDown(e) {
  if (activeTool === "reorder") return
  currentSlot = e.target.parentElement.parentElement
  currentCanvas = zine.slotsList[parseInt(currentSlot.id.replace("slot-", ""))]

  isDragging = true
  lastX = e.clientX
  lastY = e.clientY
}

function handleMouseMove(e) {
  if (!isDragging) return

  let deltaX = e.clientX - lastX
  let deltaY = e.clientY - lastY

  switch (activeTool) {
    case "rotate":
      currentCanvas.rotateBy(deltaX * rotationFactor)
      break
    case "scale":
      console.log(deltaX, scaleFactor)
      currentCanvas.scaleBy(deltaX * scaleFactor)
      break
    case "move":
      currentCanvas.moveBy(deltaX, deltaY)
      break
  }

  lastX = e.clientX
  lastY = e.clientY
}

function handleMouseUp() {
  isDragging = false
  currentSlot = null
  currentCanvas = null
}

document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    const { render } = await import("./render.js")
    render(zine.slotsList, layout.pagesOrder, foldingGuides)
  } catch (error) {
    console.error("Error importing or calling render:", error)
  }
})
