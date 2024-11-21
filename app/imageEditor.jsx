import React from "react";
import { WebView } from "react-native-webview";

const OpenCVWebView = ({ imageUri }) => {
  // Create HTML content for WebView with embedded OpenCV.js script
  const htmlContent = `
    <html>
      <head>
        <script src="https://docs.opencv.org/master/opencv.js"></script>
      </head>
      <body>
        <script>
          function processImage() {
            let img = new Image();
            img.src = "${imageUri}"; // Load the image (URL or base64)
            img.crossOrigin = "Anonymous"; // To avoid CORS issues if URL is used

            img.onload = function() {
              // Set up canvas and context
              let canvas = document.createElement('canvas');
              let ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              // Read image from canvas into OpenCV Mat format
              let src = cv.imread(canvas);
              let gray = new cv.Mat();
              let blurred = new cv.Mat();
              let adjusted = new cv.Mat();

              // Convert to grayscale
              cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

              // Apply Gaussian blur
              let ksize = new cv.Size(7, 7); // kernel size
              cv.GaussianBlur(gray, blurred, ksize, 0);

              // Adjust brightness by adding a scalar value
              let brightness = new cv.Scalar(50, 50, 50, 0); // Increase brightness
              cv.add(blurred, brightness, adjusted);

              // Display the final output
              cv.imshow('outputCanvas', adjusted);

              // Clean up memory
              src.delete(); gray.delete(); blurred.delete(); adjusted.delete();
            };
          }

          window.onload = processImage;
        </script>
        <canvas id="outputCanvas"></canvas>
      </body>
    </html>
  `;

  return <WebView originWhitelist={["*"]} source={{ html: htmlContent }} />;
};

export default OpenCVWebView;
