import Dither from './dither.js';

const contentDiv = document.querySelector('#content');

const srcCanvas = document.createElement("canvas");
contentDiv.append(srcCanvas);

const appendButton = document.createElement("button");
appendButton.textContent = "Append";
contentDiv.append(appendButton);

const ditherButton = document.createElement("button");
ditherButton.textContent = "Dither";
contentDiv.append(ditherButton);

appendButton.onclick = () => {
  // Open file upload dialog
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.click();
  fileInput.onchange = () => {
    // Read file
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      // Load image
      const image = new Image();
      image.src = reader.result;
      image.onload = () => {
        // Resize src canvas to fit image
        srcCanvas.width = image.width;
        srcCanvas.height = image.height;

        // Draw image
        const ctx = srcCanvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Make it crisp
        srcCanvas.style.imageRendering = 'pixelated';
      };
    };
    reader.readAsDataURL(file);
  };
};

let srcImage;
let ditheredImage;

ditherButton.onclick = () => {
  // Get image from src canvas
  srcImage = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  // Separate image into RGB arrays
  const srcR = [];
  const srcG = [];
  const srcB = [];
  for (let i = 0; i < srcImage.data.length; i += 4) {
    srcR.push(srcImage.data[i]);
    srcG.push(srcImage.data[i + 1]);
    srcB.push(srcImage.data[i + 2]);
  }


  const floyd = Number.parseInt(prompt("How many times should the error correction algorithm be performed?", "0"));
  {
  // Perform dithering
  const thresholdMatrix = Dither.getThresholdMatrix(4, 4);

  let ditheredR = Dither.dither(srcR, srcImage.width, thresholdMatrix);
  let ditheredG = Dither.dither(srcG, srcImage.width, thresholdMatrix);
  let ditheredB = Dither.dither(srcB, srcImage.width, thresholdMatrix);

  ditheredR = Dither.applyFloydSteinberg(srcR, ditheredR, srcImage.width, srcImage.height, thresholdMatrix, floyd);
  ditheredG = Dither.applyFloydSteinberg(srcG, ditheredG, srcImage.width, srcImage.height, thresholdMatrix, floyd);
  ditheredB = Dither.applyFloydSteinberg(srcB, ditheredB, srcImage.width, srcImage.height, thresholdMatrix, floyd);

  // Combine RGB arrays into image data
  ditheredImage = combineRGB(ditheredR, ditheredG, ditheredB, srcCanvas.width, srcCanvas.height);
  // Draw image data to canvas
  srcCanvas.getContext('2d').putImageData(ditheredImage, 0, 0);
 }
  
};

function combineRGB(r, g, b, w, h) {
  const imageData = new ImageData(w, h);
  for(let i = 0; i < r.length; i++){
    imageData.data[4*i] = r[i];
    imageData.data[4*i + 1] = g[i];
    imageData.data[4*i + 2] = b[i];
    imageData.data[4*i + 3] = 255;
  }
  return imageData;
}
