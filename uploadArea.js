import { Page } from "./Page.js"
import { zine, layout } from "./script.js"

export default function uploadArea() {
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
}

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
  function fullSlotsWarning() {
    console.log("llegaste al límite de imágenes") //may add something useful here later
  }
}
