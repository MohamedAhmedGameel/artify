import * as FileSystem from "expo-file-system";

let injectJavaScript;
let base64Image;

// Function to convert image URI to base64
const getImageBase64 = async (uri) => {
  try {
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

// Function to apply multiple image transformations at once
const applyImageTransformations = async (
  editedImageUri,
  brightnessValue = 1,
  contrastValue = 1.0,
  saturationValue = 1.0,
  filterType = "",
  thresholdValue = 128,
  sharpnessValue = 1.0,
  blurValue = 0,
  rotateValue = 0
) => {
  console.log(brightnessValue);

  // Get base64 image
  if (!base64Image) {
    base64Image = await getImageBase64(editedImageUri);
    if (!base64Image) {
      console.error("Base64 conversion failed");
      return; // Handle error if base64 conversion fails
    }
  }

  injectJavaScript = `
  (function() {
    if (typeof cv === 'undefined') {
      console.error("OpenCV.js is not loaded");
      window.ReactNativeWebView.postMessage('Error: OpenCV.js is not loaded');
      return;
    }

    let img = new Image();
    img.src = "${base64Image}";

    img.onload = function() {
      window.ReactNativeWebView.postMessage("Image loaded successfully"); // Log to confirm image loading
      try {
        let src = cv.imread(img);
        let dst = new cv.Mat();
        let hsv = new cv.Mat();

        // Apply filter if specified
        if ("${filterType}" === "grayscale") {
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
        } else {
          dst = src.clone(); // No filter applied
        }

        // Apply brightness & contrast adjustment efficiently using OpenCV
        dst.convertTo(dst, -1, ${contrastValue}, ${brightnessValue});  // Use contrast and brightness adjustments directly

        // Convert the image to HSV for saturation adjustment
        cv.cvtColor(dst, hsv, cv.COLOR_RGBA2RGB);  // Ensure the image is in the correct color space
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);   // Convert to HSV color space

        // Apply saturation adjustment directly using OpenCV functions
        if (${saturationValue} !== 1.0) {
          let channels = new cv.MatVector();
          cv.split(hsv, channels);
          let saturationChannel = channels.get(1);
          saturationChannel.convertTo(saturationChannel, -1, ${saturationValue}, 0);
          cv.merge(channels, hsv);
          channels.delete();
        }

        // Apply thresholding if specified
        if (${thresholdValue} >= 0 && ${thresholdValue} <= 255) {
          cv.threshold(dst, dst, ${thresholdValue}, 255, cv.THRESH_BINARY);
        }

        // Apply sharpness if specified
        if (${sharpnessValue} > 0) {
          let sharpnessKernel = cv.matFromArray(3, 3, cv.CV_32F, [
            -1, -1, -1,
            -1,  9, -1,
            -1, -1, -1
          ]);
          cv.filter2D(dst, dst, dst.depth(), sharpnessKernel);
          sharpnessKernel.delete();
        }

        // Apply blur if specified
        if (${blurValue} > 0) {
          cv.GaussianBlur(dst, dst, new cv.Size(${blurValue}, ${blurValue}), 0, 0, cv.BORDER_DEFAULT);
        }

        // Apply rotation if specified
        if (${rotateValue} !== 0) {
          let center = new cv.Point(dst.cols / 2, dst.rows / 2);
          let rotationMatrix = cv.getRotationMatrix2D(center, ${rotateValue}, 1);
          cv.warpAffine(dst, dst, rotationMatrix, dst.size(), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 0));
        }

        // Convert back to RGBA
        cv.cvtColor(hsv, dst, cv.COLOR_HSV2RGB); 
        cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);

        // Send processed image to React Native WebView in Base64 format
        let base64ProcessedImage = cv.imencode('.png', dst).toString('base64');
        window.ReactNativeWebView.postMessage("Processed image base64:", base64ProcessedImage); // Log to verify
        window.ReactNativeWebView.postMessage(base64ProcessedImage);

        // Cleanup
        src.delete();
        dst.delete();
        hsv.delete();
      } catch (error) {
        console.error("Processing error:", error);
        window.ReactNativeWebView.postMessage("Error: " + error.message);
      }
    };

    img.onerror = function() {
      console.error("Image failed to load");
      window.ReactNativeWebView.postMessage("Error: Image failed to load");
    };
  })();
  true;`;

  return injectJavaScript;
};

export { applyImageTransformations };
