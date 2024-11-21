import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library"; // To save images
import TouchButton from "../components/TouchButton";
import { useNavigation } from "@react-navigation/native";

import * as ImageManipulator from "expo-image-manipulator";

export default function App() {
  const image = require("../assets/New.jpg");
  const navigation = useNavigation();

  // Request permission to access the camera
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to use the camera."
      );
    }
    return status === "granted";
  };

  // Request permission to access the gallery
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Gallery permission is required to access photos."
      );
    }
    return status === "granted";
  };

  // Request media library permissions to save images
  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Media library permission is required to save photos."
      );
    }
    return status === "granted";
  };

  // Function to open camera and save the photo to the gallery
  const openCamera = async () => {
    const cameraGranted = await requestCameraPermission();
    const mediaLibraryGranted = await requestMediaLibraryPermission();

    if (cameraGranted && mediaLibraryGranted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Capture only images
        quality: 1, // Set the quality of the image
      });

      if (!result.canceled) {
        // Save to gallery
        await MediaLibrary.createAssetAsync(result.assets[0].uri);
        const uri = result.assets[0]?.uri;
        navigation.navigate("ImageEditorScreen", { imageUri: uri });
        Alert.alert("Photo Saved", "Your photo has been saved to the gallery.");
      }
    }
  };

  // Function to open gallery

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0]?.uri;

      // Use ImageManipulator to load the image and get its manipulated result
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [], // No manipulation, just load the image
          { format: ImageManipulator.SaveFormat.PNG } // Ensure the format if needed
        );

        // After manipulation, you get the manipulated URI
        const imageUri = manipResult.uri;
        console.log("Manipulated Image URI", imageUri);

        // const imageData = await getImageMatrix(imageUri);
        // console.log("Image Matrix", imageData);

        // Pass the imageUri to the ImageEditorScreen or use it for further processing
        navigation.navigate("ImageEditorScreen", { imageUri });
      } catch (error) {
        console.error("Error manipulating image:", error);
        Alert.alert("Error", "Failed to load or manipulate image");
      }
    } else {
      Alert.alert("No image selected");
    }
  };

  // Function to extract pixel data from the image
  const getImageMatrix = async (uri) => {
    const image = new Image();
    image.src = uri;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = imageData.data;

        // Create matrix
        const matrix = [];
        for (let i = 0; i < pixels.length; i += 4) {
          const row = Math.floor(i / (image.width * 4));
          const col = (i / 4) % image.width;
          if (!matrix[row]) {
            matrix[row] = [];
          }
          matrix[row][col] = {
            r: pixels[i], // Red
            g: pixels[i + 1], // Green
            b: pixels[i + 2], // Blue
            a: pixels[i + 3], // Alpha
          };
        }
        resolve(matrix);
      };
      image.onerror = reject;
    });
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={image}
        className="w-full h-full items-center justify-center"
        resizeMode="cover"
      >
        <View className="h-3/6 py-2 px-4 gap-28 ">
          <View className="w-screen flex-column items-center">
            <Text className="text-2xl text-primary-100 pt-1 font-psemibold items-center">
              Welcome to{" "}
              <Text className="font-PCregular text-primary">Artify</Text>
            </Text>
            <Text className="text-primary-200 font-plight text-xs">
              Art in every pixel.
            </Text>
          </View>

          {/* Buttons Section */}
          <View className="w-screen flex-row justify-around">
            {/* Camera Button */}
            <TouchButton
              text="Camera"
              icon="camera-outline"
              func={openCamera}
            />

            {/* Gallery Button */}
            <TouchButton
              text="Gallery"
              icon="image-outline"
              func={openGallery}
            />
          </View>
        </View>
        <StatusBar style="light" />
      </ImageBackground>
    </View>
  );
}