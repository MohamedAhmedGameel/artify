import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { cropImage, applyFilter, rotateImage } from './imageUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import {
  Crop,
  RotateCcw,
  Image as ImageIcon,
  Save,
  Sliders,
  Sun,
  Contrast,
  CloudSnow,
  Droplet,
  Sunset,
  Coffee,
  Moon
} from 'lucide-react-native';

const ImageEditorScreen = ({ navigation }) => {
  const route = useRoute();
  const imageUri = route?.params?.imageUri;
  const [editedImageUri, setEditedImageUri] = useState(imageUri);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const tools = [
    {
      id: 'crop',
      name: 'Crop',
      icon: Crop,
      action: async () => {
        const croppedUri = await cropImage(editedImageUri);
        setEditedImageUri(croppedUri);
      }
    },
    {
      id: 'rotate',
      name: 'Rotate',
      icon: RotateCcw,
      action: async () => {
        const rotatedUri = await rotateImage(editedImageUri, 90);
        setEditedImageUri(rotatedUri);
      }
    },
    {
      id: 'original',
      name: 'Original',
      icon: ImageIcon,
      action: () => setEditedImageUri(imageUri)
    },
    {
      id: 'brightness',
      name: 'Brightness',
      icon: Sun,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'brightness');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'contrast',
      name: 'Contrast',
      icon: Contrast,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'contrast');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'grayscale',
      name: 'Grayscale',
      icon: Sliders,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'grayscale');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'sepia',
      name: 'Sepia',
      icon: Coffee,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'sepia');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'cool',
      name: 'Cool',
      icon: CloudSnow,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'cool');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'warm',
      name: 'Warm',
      icon: Sunset,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'warm');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'vintage',
      name: 'Vintage',
      icon: Moon,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'vintage');
        setEditedImageUri(filteredUri);
      }
    },
    {
      id: 'saturation',
      name: 'Saturation',
      icon: Droplet,
      action: async () => {
        const filteredUri = await applyFilter(editedImageUri, 'saturate');
        setEditedImageUri(filteredUri);
      }
    }
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      {editedImageUri ? (
        <>
          <View style={styles.imageContainer}>
            <Image source={{ uri: editedImageUri }} style={styles.image} />
          </View>

          <View style={styles.toolbarContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.toolbar}
              contentContainerStyle={styles.toolbarContent}
            >
              {tools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[
                    styles.toolButton,
                    selectedTool === tool.id && styles.selectedToolButton
                  ]}
                  onPress={() => {
                    setSelectedTool(tool.id);
                    tool.action();
                  }}
                >
                  <tool.icon
                    size={24}
                    color={selectedTool === tool.id ? '#ffffff' : '#666666'}
                  />
                  <Text style={[
                    styles.toolText,
                    selectedTool === tool.id && styles.selectedToolText
                  ]}>
                    {tool.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveImage}
          >
            <Save size={24} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Image</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noImageText}>No image selected.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  toolbarContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toolbar: {
    flexGrow: 0,
  },
  toolbarContent: {
    paddingHorizontal: 15,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    width: 80,
  },
  selectedToolButton: {
    backgroundColor: '#4CAF50',
  },
  toolText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  selectedToolText: {
    color: '#ffffff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noImageText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ImageEditorScreen;