const contentDiv = $('#content');

const srcCanvas = $("<canvas></canvas>");
contentDiv.append(srcCanvas);

const appendButton = $(`<button>Append</button>`);
contentDiv.append(appendButton);

const ditherButton = $(`<button>Dither</button>`);
contentDiv.append(ditherButton);

const logSpan = $('<span></span>');
contentDiv.append(logSpan);

appendButton.click(() => {
  // Open file upload dialog
  const fileInput = $('<input type="file" accept="image/*">');
  fileInput.click();
  fileInput.change(() => {
    // Read file
    const file = fileInput[0].files[0];
    const reader = new FileReader();
    reader.onload = () => {
      // Load image
      const image = new Image();
      image.src = reader.result;
      image.onload = () => {
        // Resize src canvas to fit image
        srcCanvas[0].width = image.width;
        srcCanvas[0].height = image.height;

        // Draw image
        const ctx = srcCanvas[0].getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Make it crisp
        srcCanvas.css('image-rendering', 'pixelated');
      };
    };
    reader.readAsDataURL(file);
  });
});

let srcImage;
let ditheredImage;

ditherButton.click(() => {
  // Get image from src canvas
  srcImage = srcCanvas[0].getContext('2d').getImageData(0, 0, srcCanvas[0].width, srcCanvas[0].height);
  // Separate image into RGB arrays
  const srcR = [];
  const srcG = [];
  const srcB = [];
  for (let i = 0; i < srcImage.data.length; i += 4) {
    srcR.push(srcImage.data[i]);
    srcG.push(srcImage.data[i + 1]);
    srcB.push(srcImage.data[i + 2]);
  }


  const floyd = Number.parseInt(prompt("do floyd times?", "0"));
  {
  // Perform dithering
  const ditheredR = dither(srcR, srcImage.width, srcImage.height, floyd);
  const ditheredG = dither(srcG, srcImage.width, srcImage.height, floyd);
  const ditheredB = dither(srcB, srcImage.width, srcImage.height, floyd);
  // Combine RGB arrays into image data
  ditheredImage = combineRGB(ditheredR, ditheredG, ditheredB, srcCanvas[0].width, srcCanvas[0].height);
  // Draw image data to canvas
  srcCanvas[0].getContext('2d').putImageData(ditheredImage, 0, 0);
 }
  
});

function log(message) {
  logSpan.text(message);
};

function getRandomThresholdMatrix( width, height) {
  values = getThresholdList(width, height);
  const matrix = [];
  for(let i = 0; i < width; i++) {
    matrix.push([]);
    for(let j = 0; j < height; j++) {
      // Pick one value
      const index = Math.floor(Math.random() * values.length);
      const value = values[index];
      // Remove value from list
      values.splice(index, 1);
      matrix[i].push(value);
    }
  }
  return matrix;
};

function getThresholdList(width, height) {
  const values = [];
  const count = width * height + 1;

  const blackBias = 0;

  for(let i = 1; i < count; i++) {
    values.push(Math.round(255/ count * (i + blackBias)));
  }
  return values;
}
const thresholdMatrix = getRandomThresholdMatrix(4, 4);

function dither(src, width, height, floyd=0) {
  let dithered = [];

  for (let i = 0; i < src.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const ditheredPixel = applyThreshold(src[i], x, y, thresholdMatrix);
    dithered.push(ditheredPixel);
  }

  for(let i = 0; i < floyd; i++) {
    if(i%2 == 0){
      dithered = floydSteinberg(src, dithered, width, height, thresholdMatrix);
    }
    else{
      dithered = reverseFloydSteinberg(src, dithered, width, height, thresholdMatrix);
    }
  }
  return dithered;
}

function floydSteinberg(src, dithered, width, height, thresholdMatrix) {
  const corrected = [];
  const errorMatrix = [];
  // Fill error matrix with zeros
  for(let i = 0; i < width; i++) {
    errorMatrix.push([]);
    for(let j = 0; j < height; j++) {
      errorMatrix[i].push(0);
    }
  }
  for (let i = 0; i < src.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);

    let ditheredPixel = dithered[i] + errorMatrix[x][y];
    const error = src[i] - ditheredPixel;
    // Distribute error to surrounding pixels
    if(x + 1 < width) {
      errorMatrix[x + 1][y] += error * 7 / 16;
    }
    if((x - 1 >= 0) && (y + 1 < height)) {
      errorMatrix[x - 1][y + 1] += error * 3 / 16;
    }
    if(y + 1 < height) {
      errorMatrix[x][y + 1] += error * 5 / 16;
    }
    if((x + 1 < width) && (y + 1 < height)) {
      errorMatrix[x + 1][y + 1] += error * 1 / 16;
    }

    if(y % Math.round(width / 100) === 0 && x === 0) {
      console.log(`${Math.round(100 * i / src.length)}%`);
    }
  

    corrected.push(applyThreshold(ditheredPixel, x, y, thresholdMatrix));
    }
  return corrected;
}

function reverseFloydSteinberg(src, dithered, width, height, thresholdMatrix) {
  const corrected = [];
  const errorMatrix = [];
  // Fill error matrix with zeros
  for(let i = 0; i < width; i++) {
    errorMatrix.push([]);
    for(let j = 0; j < height; j++) {
      errorMatrix[i].push(0);
    }
  }
  for (let i = src.length - 1; i >= 0; i--) {
    const x = i % width;
    const y = Math.floor(i / width);

    let ditheredPixel = dithered[i] + errorMatrix[x][y];
    const error = src[i] - ditheredPixel;
    // Distribute error to surrounding pixels
    if(x - 1 >= 0) {
      errorMatrix[x - 1][y] += error * 7 / 16;
    }
    if((x + 1 < width) && (y - 1 >= 0)) {
      errorMatrix[x + 1][y - 1] += error * 3 / 16;
    }
    if(y - 1 >= 0) {
      errorMatrix[x][y - 1] += error * 5 / 16;
    }
    if((x - 1 >= 0) && (y - 1 >= 0)) {
      errorMatrix[x - 1][y - 1] += error * 1 / 16;
    }

    if(y % Math.round(width / 25) === 0 && x === 0) {
      console.log(`${Math.round(100 * i / src.length)}%`);
    }
  

    corrected.push(applyThreshold(ditheredPixel, x, y, thresholdMatrix));
    }
  return corrected.reverse();
}


function applyThreshold(value, x, y, thresholdMatrix) {
  const cut = 255 / 17;

  return (value >=
    thresholdMatrix[x%thresholdMatrix.length][y%thresholdMatrix[0].length]
    ) ? 255 - cut: 0 + cut;
}

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
