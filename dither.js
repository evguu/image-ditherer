export default class Dither{
  static getThresholdMatrix(width, height) {
    const values = getThresholdList(width, height);
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
  }

  static dither(src, width, thresholdMatrix) {
    let dithered = [];

    for (let i = 0; i < src.length; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      const ditheredPixel = applyThreshold(src[i], x, y, thresholdMatrix);
      dithered.push(ditheredPixel);
    }

    return dithered;
  }

  static applyFloydSteinberg(src, dithered, width, height, thresholdMatrix, times) {
    for(let i = 0; i < times; i++) {
      if(i%2 == 0){
        dithered = floydSteinberg(src, dithered, width, height, thresholdMatrix);
      }
      else{
        dithered = reverseFloydSteinberg(src, dithered, width, height, thresholdMatrix);
      }
    }
    return dithered;
  }
}

function getThresholdList(width, height) {
  const values = [];
  const count = width * height + 1;

  const blackBias = 0;

  for(let i = 1; i < count; i++) {
    values.push(Math.round(255/ count * (i + blackBias)));
  }
  return values;
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
  return (value >=
    thresholdMatrix[x%thresholdMatrix.length][y%thresholdMatrix[0].length]
    ) ? 255: 0;
}