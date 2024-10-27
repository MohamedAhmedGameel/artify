import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library'; // To save images
import TouchButton from "../components/TouchButton";
import { useNavigation } from '@react-navigation/native';


export default function App() {
  const image = require("../assets/New.jpg");
  const navigation = useNavigation();

  // Request permission to access the camera
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera permission is required to use the camera.");
    }
    return status === 'granted';
  };

  // Request permission to access the gallery
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Gallery permission is required to access photos.");
    }
    return status === 'granted';
  };

  // Request media library permissions to save images
  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Media library permission is required to save photos.");
    }
    return status === 'granted';
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
        navigation.navigate('ImageEditorScreen', { imageUri: uri });
        Alert.alert("Photo Saved", "Your photo has been saved to the gallery.");
      }
    }
  };

  // Function to open gallery
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
  
    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      navigation.navigate('ImageEditorScreen', { imageUri: uri });
    } else {
      Alert.alert('No image selected');
    }
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
            <TouchButton text="Camera" icon="camera-outline" func={openCamera} />

            {/* Gallery Button */}
            <TouchButton text="Gallery" icon="image-outline" func={openGallery} />
          </View>
        </View>
        <StatusBar style="light" />
      </ImageBackground>
    </View>
  );
}
