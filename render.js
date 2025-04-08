export function render(pages, finalOrder, foldingGuides) {
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
  ctx.imageSmoothingEnabled = true // Enable smoothing
  ctx.imageSmoothingQuality = "high" // Set quality level
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height)

  let rowPosition = 0
  // First column: rotate by Math.PI/2 and translate to (outputCanvas.width/2, rowPosition)
  firstColumnCanvases.forEach(canvas => {
    if (canvas) {
      drawColumn(
        ctx,
        canvas,
        outputCanvas.width / 2,
        rowPosition,
        Math.PI / 2,
        pageWidth,
        pageHeight
      )
    }
    rowPosition += pageWidth
  })

  let columnPosition = 0
  // Second column: rotate by 3*Math.PI/2 and translate to (outputCanvas.width/2, outputCanvas.height - columnPosition)
  secondColumnCanvases.forEach(canvas => {
    if (canvas) {
      drawColumn(
        ctx,
        canvas,
        outputCanvas.width / 2,
        outputCanvas.height - columnPosition,
        3 * (Math.PI / 2),
        pageWidth,
        pageHeight
      )
    }
    columnPosition += pageWidth
  })

  drawFoldingGuides(ctx, outputCanvas.width, outputCanvas.height, foldingGuides)

  showFinalPage(outputCanvas)
}

function drawColumn(ctx, canvas, posX, posY, rotationAngle, pageWidth, pageHeight) {
  ctx.save()
  ctx.translate(posX, posY)
  ctx.rotate(rotationAngle)
  ctx.drawImage(canvas, 0, 0, pageWidth, pageHeight)
  ctx.restore()
}

function drawFoldingGuides(ctx, outputWidth, outputHeight, foldingGuides) {
  if (!foldingGuides.active) return

  ctx.save()
  ctx.strokeStyle = foldingGuides.color
  ctx.lineWidth = foldingGuides.width

  // Set the dash pattern based on the style
  switch (foldingGuides.style) {
    case "dashed":
      ctx.setLineDash([10, 5])
      break
    case "dotted":
      ctx.setLineDash([2, 4])
      break
    default:
      ctx.setLineDash([])
      break
  }

  // Draw vertical line in the middle of the page
  ctx.beginPath()
  ctx.moveTo(outputWidth / 2, 0)
  ctx.lineTo(outputWidth / 2, outputHeight)
  ctx.stroke()

  // Draw three horizontal lines dividing the page into four equal rows
  const quarterHeight = outputHeight / 4
  for (let i = 1; i < 4; i++) {
    const y = quarterHeight * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(outputWidth, y)
    ctx.stroke()
  }
  ctx.restore()
}

function showFinalPage(outputCanvas) {
  const link = document.createElement("a")
  link.href = outputCanvas.toDataURL("image/jpeg", 1.0)
  link.download = "fanzine.jpg"
  link.click()
}
