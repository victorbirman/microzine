export function render(pages, finalOrder) {
  const firstRowOrder = [6, 5, 4, 3]
  const secondRowOrder = [7, 0, 1, 2]
  const firstRowCanvases = firstRowOrder.map(num => pages[finalOrder[num]]?.canvas)
  const secondRowCanvases = secondRowOrder.map(num => pages[finalOrder[num]]?.canvas)

  const referenceCanvas =
    firstRowCanvases.find(canvas => canvas) ||
    secondRowCanvases.find(canvas => canvas)
  if (!referenceCanvas) {
    console.error("No valid canvases found to combine.")
    return
  }

  const canvasWidth = referenceCanvas.width
  const canvasHeight = referenceCanvas.height

  const combinedWidth = canvasWidth * 4
  const combinedHeight = canvasHeight * 2

  const combinedCanvas = document.createElement("canvas")
  combinedCanvas.width = combinedWidth
  combinedCanvas.height = combinedHeight

  const ctx = combinedCanvas.getContext("2d")
  ctx.fillStyle = "white"

  ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)

  let offsetX = 0
  firstRowCanvases.forEach(canvas => {
    if (canvas) {
      ctx.save()

      ctx.translate(offsetX + canvasWidth / 2, canvasHeight / 2)
      ctx.rotate(Math.PI)
      ctx.drawImage(
        canvas,
        -canvasWidth / 2,
        -canvasHeight / 2,
        canvasWidth,
        canvasHeight
      )
      ctx.restore()
    }
    offsetX += canvasWidth
  })

  offsetX = 0
  const offsetY = canvasHeight
  secondRowCanvases.forEach(canvas => {
    if (canvas) {
      ctx.drawImage(canvas, offsetX, offsetY, canvasWidth, canvasHeight)
    }
    offsetX += canvasWidth
  })

  document.body.appendChild(combinedCanvas)

  const link = document.createElement("a")
  link.href = combinedCanvas.toDataURL("image/jpeg", 1.0)
  link.download = "fanzine.jpg"
  link.textContent = "Descargar fanzine"

  document.body.appendChild(link)
}
