import { Page } from "./Page.js"
import { zine, layout } from "./script.js"
//import { uploader } from "./script.js"

export default function dropArea() {
  const dropArea = document.getElementById("dropArea")
  const uploadBtn = document.getElementById("uploadBtn")
  const fileInput = document.getElementById("fileInput")

  const handleUploadBtnClick = () => {
    fileInput.click()
  }

  const handleFileInputChange = e => {
    importImages(e.target.files)
    e.target.value = "" // Allow re-upload of the same file
  }

  const handleDrop = e => {
    e.preventDefault()
    dropArea.classList.remove("dragover")
    importImages(e.dataTransfer.files)
  }

  const handleDragOver = e => {
    e.preventDefault()
    dropArea.classList.add("dragover")
  }

  const handleDragLeave = () => {
    dropArea.classList.remove("dragover")
  }

  function enableDropArea() {
    uploadBtn.addEventListener("click", handleUploadBtnClick)
    fileInput.addEventListener("change", handleFileInputChange)
    dropArea.addEventListener("drop", handleDrop)
    dropArea.addEventListener("dragover", handleDragOver)
    dropArea.addEventListener("dragleave", handleDragLeave)

    dropArea.classList.remove("disabled")
    uploadBtn.classList.remove("disabled")
    fileInput.disabled = false
  }

  function disableDropArea() {
    uploadBtn.removeEventListener("click", handleUploadBtnClick)
    fileInput.removeEventListener("change", handleFileInputChange)
    dropArea.removeEventListener("drop", handleDrop)
    dropArea.removeEventListener("dragover", handleDragOver)
    dropArea.removeEventListener("dragleave", handleDragLeave)

    dropArea.classList.add("disabled")
    uploadBtn.classList.add("disabled")
    fileInput.disabled = true
  }

  return { enableDropArea, disableDropArea }
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
    console.log("llegaste al límite de imágenes")
    //uploader.disableDropArea()
  }
}
