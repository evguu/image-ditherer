export default class Threshold {
  constructor(width, height) {
    this.matrix = getThresholdMatrix(width, height);
  }
  
  _applyThreshold(value, x, y) {
    return (value >=
      this.matrix[x%this.matrix.length][y%this.matrix[0].length]
      ) ? 255: 0;
  }

  applyThresholdToArray(src, width) {
    let thresholded = [];

    for (let i = 0; i < src.length; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      const thresholdedPixel = this._applyThreshold(src[i], x, y, this.matrix);
      thresholded.push(thresholdedPixel);
    }

    return thresholded;
  }
}

function getThresholdMatrix(width, height) {
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

function getThresholdList(width, height) {
  const values = [];
  const count = width * height + 1;

  for(let i = 1; i < count; i++) {
    values.push(Math.round(255/ count * i));
  }
  return values;
}