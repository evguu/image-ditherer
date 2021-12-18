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

ditherButton.onclick = () => {
  const floydSteinbergIterations = Number.parseInt(prompt("How many times should the error correction algorithm be performed?", "0"));
  const srcImage = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const ditheredImage = new Dither(3, 3).ditherImage(srcImage, floydSteinbergIterations);
  srcCanvas.getContext('2d').putImageData(ditheredImage, 0, 0);
};
