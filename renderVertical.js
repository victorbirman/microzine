export function render(pages, finalOrder) {
  const firstColumnOrder = [7, 0, 1, 2]
  const secondColumnOrder = [3, 4, 5, 6]

  const firstColumnCanvases = firstColumnOrder.map(
    num => pages[finalOrder[num]]?.canvas
  )
  const secondColumnCanvases = secondColumnOrder.map(
    num => pages[finalOrder[num]]?.canvas
  )

  const referenceCanvas =
    firstColumnCanvases.find(canvas => canvas) ||
    secondColumnCanvases.find(canvas => canvas)
  if (!referenceCanvas) {
    console.error("No valid canvases found to combine.")
    return
  }

  const pageWidth = referenceCanvas.width
  const pageHeight = referenceCanvas.height

  const outputCanvas = document.createElement("canvas")
  outputCanvas.width = referenceCanvas.height * 2
  outputCanvas.height = referenceCanvas.width * 4

  const ctx = outputCanvas.getContext("2d")
  ctx.fillStyle = "white"
  console.log(
    "pagew",
    pageWidth,
    "pageh",
    pageHeight,
    "canW",
    outputCanvas.width,
    "canH",
    outputCanvas.height
  )
  ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height)

  let rowPosition = 0
  firstColumnCanvases.forEach(canvas => {
    if (canvas) {
      ctx.save()
      ctx.translate(outputCanvas.width / 2, rowPosition)

      ctx.rotate(Math.PI / 2)

      ctx.drawImage(canvas, 0, 0, pageWidth, pageHeight)
      ctx.restore()
    }
    rowPosition += pageWidth
  })

  let columnPosition = 0
  secondColumnCanvases.forEach(canvas => {
    if (canvas) {
      ctx.save()
      ctx.translate(outputCanvas.width / 2, outputCanvas.height - columnPosition)

      ctx.rotate(3 * (Math.PI / 2))

      ctx.drawImage(canvas, 0, 0, pageWidth, pageHeight)
      ctx.restore()
    }
    columnPosition += pageWidth
  })

  document.body.appendChild(outputCanvas)

  const link = document.createElement("a")
  link.href = outputCanvas.toDataURL("image/jpeg", 1.0)
  link.download = "fanzine.jpg"
  link.textContent = "Descargar fanzine"

  document.body.appendChild(link)
}
