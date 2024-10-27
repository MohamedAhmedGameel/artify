import React, { useState, useEffect } from 'react';
import { View, Image, Button, ScrollView, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { cropImage, applyFilter, rotateImage } from './imageUtils'; // Adjust import if needed
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

const ImageEditorScreen = ({ route, navigation }) => {
  route = useRoute()
  

  const imageUri = route?.params?.imageUri; 

  const [editedImageUri, setEditedImageUri] = useState(imageUri);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to save images.');
      }
    };
    requestPermission();
  }, []);

  const saveImage = async () => {
    if (!hasPermission) {
      Alert.alert('Error', 'You need to allow gallery access to save the image.');
      return;
    }

    try {
      await MediaLibrary.createAssetAsync(editedImageUri);
      Alert.alert('Success', 'Image saved to your gallery!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save the image.');
    }
  };

  const ActionButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {editedImageUri ? (
        <>
          <Image source={{ uri: editedImageUri }} style={styles.image} />
          <ScrollView horizontal style={styles.options}>
          <ActionButton 
                title="Crop" 
                onPress={async () => {
                  const croppedUri = await cropImage(editedImageUri);
                  setEditedImageUri(croppedUri);
                }} 
              />

          <ActionButton 
                title="Filter" 
                onPress={async () => {
                  const filteredUri = await applyFilter(editedImageUri, 'grayscale');
                  setEditedImageUri(filteredUri);
                }} 
              />

          <ActionButton 
                title="Rotate" 
                onPress={async () => {
                  const rotatedUri = await rotateImage(editedImageUri, 90);
                  setEditedImageUri(rotatedUri);
                }} 
              />

          </ScrollView>
          <Button title="Save Image" onPress={saveImage} />
        </>
      ) : (
        <Text>No image selected.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 10,
    marginVertical: 20,
  },
  options: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageEditorScreen;
