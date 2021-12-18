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
    const correctedR = FloydSteinberg.applyFloydSteinberg(srcR, thresholdedR, srcImage.width, srcImage.height, floydSteinbergIterations, this.threshold.applyThresholdToArray.bind(this.threshold));
    const correctedG = FloydSteinberg.applyFloydSteinberg(srcG, thresholdedG, srcImage.width, srcImage.height, floydSteinbergIterations, this.threshold.applyThresholdToArray.bind(this.threshold));
    const correctedB = FloydSteinberg.applyFloydSteinberg(srcB, thresholdedB, srcImage.width, srcImage.height, floydSteinbergIterations, this.threshold.applyThresholdToArray.bind(this.threshold));

    // Combine RGB arrays into image data
    const ditheredImage = RGB.combine(correctedR, correctedG, correctedB, srcImage.width, srcImage.height);
  
    // Return image data
    return ditheredImage;
  }
}

