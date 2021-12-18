export default class RGB{
  static separate(imageData){
    const srcR = [];
    const srcG = [];
    const srcB = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      srcR.push(imageData.data[i]);
      srcG.push(imageData.data[i + 1]);
      srcB.push(imageData.data[i + 2]);
    }

    return {srcR, srcG, srcB};
  }

  static combine(srcR, srcG, srcB, width, height){
    const imageData = new ImageData(width, height);
    
    for(let i = 0; i < srcR.length; i++){
      imageData.data[4*i] = srcR[i];
      imageData.data[4*i + 1] = srcG[i];
      imageData.data[4*i + 2] = srcB[i];
      imageData.data[4*i + 3] = 255;
    }
    
    return imageData;
  }
}