export const cropText = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d");
  if (context) {
    // Find the bounding box of the drawing
    const drawnImage = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = drawnImage;
    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Add some padding
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    // Create a new canvas with the cropped size
    const croppedCanvas = document.createElement("canvas");
    const croppedContext = croppedCanvas.getContext("2d");

    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;

    // Paint the cropped canvas white
    if (croppedContext) {
      croppedContext.fillStyle = "white";
      croppedContext.fillRect(0, 0, croppedWidth, croppedHeight);
    }

    // Draw the cropped image
    croppedContext?.drawImage(
      canvas,
      minX,
      minY,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );

    const imageData = croppedCanvas.toDataURL("image/png");
    return imageData;
  }
  return "";
};
