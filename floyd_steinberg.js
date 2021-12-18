export default class FloydSteinberg{
  static performForward(src, dithered, width, height) {
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
  
      corrected.push(ditheredPixel);
      }
    return corrected;
  }
  
  static performBackward(src, dithered, width, height) {
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
  
      corrected.push(ditheredPixel);
      }
    return corrected.reverse();
  }
}