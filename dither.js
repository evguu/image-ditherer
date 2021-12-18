import RGB from './rgb.js';
import FloydSteinberg from './floyd_steinberg.js';

export default class Dither{

  constructor(threshold) {
    this.threshold = threshold;
  }

  ditherImage(srcImage, floydSteinbergIterations) {
    const {srcR, srcG, srcB} = RGB.separate(srcImage);

    // Dither image
    const thresholdedR = this.threshold.applyThresholdToArray(srcR, srcImage.width);
    const thresholdedG = this.threshold.applyThresholdToArray(srcG, srcImage.width);
    const thresholdedB = this.threshold.applyThresholdToArray(srcB, srcImage.width);

    // Apply Floyd-Steinberg error correction
    const correctedR = this.applyFloydSteinberg(srcR, thresholdedR, srcImage.width, srcImage.height, floydSteinbergIterations);
    const correctedG = this.applyFloydSteinberg(srcG, thresholdedG, srcImage.width, srcImage.height, floydSteinbergIterations);
    const correctedB = this.applyFloydSteinberg(srcB, thresholdedB, srcImage.width, srcImage.height, floydSteinbergIterations);

    // Combine RGB arrays into image data
    const ditheredImage = RGB.combine(correctedR, correctedG, correctedB, srcImage.width, srcImage.height);
  
    // Return image data
    return ditheredImage;
  }

  applyFloydSteinberg(src, dithered, width, height, times) {
    let corrected = dithered.concat();
    for(let i = 0; i < times; i++) {
      if(i%2 == 0){
        corrected = FloydSteinberg.performForward(src, corrected, width, height);
      }
      else{
        corrected = FloydSteinberg.performBackward(src, corrected, width, height);
      }
      corrected = this.threshold.applyThresholdToArray(corrected, width);
    }
    return corrected;
  }
}

