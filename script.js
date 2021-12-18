import Dither from './dither.js';
import Threshold from './threshold.js';
import ImageLoad from './image_load.js';

const contentDiv = document.querySelector('#content');

const srcCanvas = document.createElement("canvas");
const appendButton = document.createElement("button");
const ditherButton = document.createElement("button");

appendButton.textContent = "Append";
ditherButton.textContent = "Dither";

contentDiv.append(srcCanvas);
contentDiv.append(appendButton);
contentDiv.append(ditherButton);

appendButton.onclick = () => {
  ImageLoad.loadImage(image => {
    srcCanvas.width = image.width;
    srcCanvas.height = image.height;
    const ctx = srcCanvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    srcCanvas.style.imageRendering = 'pixelated';
  });
};

ditherButton.onclick = () => {
  const floydSteinbergIterations = Number.parseInt(prompt("How many times should the error correction algorithm be performed?", "0"));
  const srcImage = srcCanvas.getContext('2d').getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const ditheredImage = new Dither(new Threshold(4, 4)).ditherImage(srcImage, floydSteinbergIterations);
  srcCanvas.getContext('2d').putImageData(ditheredImage, 0, 0);
};
