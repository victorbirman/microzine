import { SlotList } from "./SlotList.js"
import { sortable } from "./sortable.js"
import dropArea from "./dropArea.js"
import render from "./render.js"

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
  btn.addEventListener("click", () => activateTool(selectedTool(btn.id)))
})

function selectedTool(clickedTool) {
  return clickedTool === "reorder" || clickedTool === activeTool
    ? "reorder"
    : clickedTool
}

function activateTool(tool) {
  activeTool = tool
  toolsButtons.forEach(btn => {
    btn.classList.toggle("active", btn.id === activeTool)
  })
  sortable.options.disabled = tool !== "reorder"
  slots.forEach(slot => (slot.dataset.tool = activeTool))
}

const keyMap = {
  o: "reorder",
  m: "move",
  g: "rotate",
  e: "scale",
}

document.addEventListener("keydown", e => {
  const tool = keyMap[e.key.toLowerCase()]
  if (tool) activateTool(selectedTool(tool))
})

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
  const btn = document.getElementById("renderBtn")
  const label = btn.querySelector(".btn-label")
  const spinner = btn.querySelector(".spinner")
  const checkmark = btn.querySelector(".checkmark")

  btn.disabled = true
  label.textContent = "Generando..."
  spinner.hidden = false
  checkmark.hidden = true

  // Esperar dos frames para asegurar repintado visual
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

  try {
    const canvas = await render(zine.slotsList, layout.pagesOrder, foldingGuides)
    if (canvas) {
      showFinalPage(canvas)
      checkmark.hidden = false
    }
  } catch (error) {
    console.error("Error calling render:", error)
    alert("Hubo un error generando el fanzine.")
  } finally {
    label.textContent = "Descargar fanzine"
    spinner.hidden = true
    btn.disabled = false
    spinner.hidden = true
    setTimeout(() => {
      checkmark.hidden = true
    }, 3000)
  }
})

function showFinalPage(outputCanvas) {
  const link = document.createElement("a")
  link.href = outputCanvas.toDataURL("image/jpeg", 1.0)
  link.download = "fanzine.jpg"
  link.click()
}
