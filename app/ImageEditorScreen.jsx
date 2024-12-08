import React, { useState, useEffect } from "react";
import Slider from "@react-native-community/slider";
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { cropImage, applyFilter, rotateImage } from "./imageUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import {
  Crop,
  ArrowLeft,
  Download,
  Undo,
  Redo,
  RotateCcw,
  Image as ImageIcon,
  Save,
  Sun,
  Contrast,
  Droplet,
  Filter,
  BookDashed,
  Circle,
  SwitchCamera,
  Radar,
  Grip,
} from "lucide-react-native";
import { Canvas, Image, useImage } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const imageWidth = width;
const imageHeight = height - 400;

const ImageEditorScreen = ({ }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const imageUri = route?.params?.imageUri;

  const [editedImageUri, setEditedImageUri] = useState(imageUri);
  const [hasPermission, setHasPermission] = useState(false);
  const editedImage = useImage(editedImageUri);

  const [selectedTool, setSelectedTool] = useState(null);
  const [brightnessValue, setBrightnessValue] = useState(1);
  const [contrastValue, setContrastValue] = useState(1);
  const [saturationValue, setSaturationValue] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isBrightnessVisible, setIsBrightnessVisible] = useState();
  const [isContrastVisible, setIsContrastVisible] = useState();
  const [isSaturationVisible, setIsSaturationVisible] = useState();
  const [selectedIntensityTool, setSelectedIntensityTool] = useState(null);
  const [thresholdVisible, setThresholdVisible] = useState(false);
  const [selectedThresholdTool, setSelectedThresholdTool] = useState(null);
  const [intensityVisible, setIntensityVisible] = useState(false);
  const [selectedBlurTool, setSelectedBlurTool] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  const filters = [
    { id: "grayscale", name: "Grayscale" },
    { id: "sepia", name: "Sepia" },
    { id: "cool", name: "Cool" },
    { id: "warm", name: "Warm" },
    { id: "vintage", name: "Vintage" },
  ];

  const intensityTools = [
    { id: "log", name: "Log" },
    { id: "power_law", name: "Power Law" },
  ];

  const ThresholdTools = [
    { id: "simple", name: "Simple" },
    { id: "segmentation", name: "Segmentation" },
    { id: "otsu", name: "Otsu" },
  ];
  const BlurTools = [
    { id: "Gaussian", name: "Gaussian" },
    { id: "Bilateral", name: "Bilateral" },
  ];

  const tools = [
    {
      id: "brightness",
      name: "Brightness",
      icon: Sun,
      action: () => handleToolSelect("brightness"),
    },
    {
      id: "contrast",
      name: "Contrast",
      icon: Contrast,
      action: () => handleToolSelect("contrast"),
    },
    {
      id: "saturation",
      name: "Saturation",
      icon: Droplet,
      action: () => handleToolSelect("saturation"),
    },
    {
      id: "filters",
      name: "Filters",
      icon: Filter,
      action: () => handleToolSelect("filters"),
    },
    {
      id: "Intensitytransformation",
      name: "Intensity",
      icon: Circle,
      action: () => handleToolSelect("Intensitytransformation"),
    },
    // {
    //   id: "Histogram equalization",
    //   name: "Histogram",
    //   icon: SwitchCamera,
    //   action: () => handleToolSelect("Histogram equalization"),
    // },
    {
      id: "Threshold",
      name: "Threshold",
      icon: Radar,
      action: () => handleToolSelect("Threshold"),
    },
    {
      id: "Blur",
      name: "Blur",
      icon: Grip,
      action: () => handleToolSelect("Blur"),
    },
    {
      id: "rotate",
      name: "Rotate",
      icon: RotateCcw,
      action: async () => {
        const rotatedUri = await rotateImage(editedImageUri, 90);
        setEditedImageUri(rotatedUri);
      },
    },
    {
      id: "original",
      name: "Original",
      icon: ImageIcon,
      action: () => setEditedImageUri(imageUri),
    },
  ];

  const handleAdjustment = async () => {
    const adjustedUri = await applyFilter(
      imageUri,
      "adjust",
      brightnessValue,
      contrastValue,
      saturationValue
    );
    setEditedImageUri(adjustedUri);
  };

  const handleFilterClick = (filter) => {
    if (selectedFilter === filter) {
      // Deselect the filter if already selected
      setSelectedFilter(null);
    } else {
      // Select the new filter
      setSelectedFilter(filter);
    }
  };

  const handleIntensityClick = (tool) => {
    if (selectedIntensityTool === tool) {
      // Deselect the filter if already selected
      setSelectedIntensityTool(null);
    } else {
      // Select the new filter
      setSelectedIntensityTool(tool);
    }
  };

  const handleThresholdClick = (tool) => {
    if (selectedThresholdTool === tool) {
      // Deselect the filter if already selected
      setSelectedThresholdTool(null);
    } else {
      // Select the new filter
      setSelectedThresholdTool(tool);
    }
  };

  const saveImage = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Error",
        "You need to allow gallery access to save the image."
      );
      return;
    }

    try {
      await MediaLibrary.createAssetAsync(editedImageUri);
      Alert.alert("Success", "Image saved to your gallery!");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save the image.");
    }
  };

  const handleToolSelect = (toolId) => {
    if (selectedTool === toolId) {
      setSelectedTool(null);
      setIsBrightnessVisible(false);
      setIsContrastVisible(false);
      setIsSaturationVisible(false);
      setShowFilters(false);
      setIntensityVisible(null);
      setThresholdVisible(false);
    } else {
      setSelectedTool(toolId);
      setIsBrightnessVisible(toolId === "brightness");
      setIsContrastVisible(toolId === "contrast");
      setIsSaturationVisible(toolId === "saturation");
      setShowFilters(toolId === "filters");
      setIntensityVisible(toolId === "Intensitytransformation");
      setThresholdVisible(toolId === "Threshold");
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Gallery access is needed to save images."
        );
      }
    };
    requestPermission();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" backgroundColor="#000000" />
      <View className="h-20 flex-row justify-between items-center px-5 bg-neutral-900 rounded-b-3xl">
        <TouchableOpacity onPress={() => navigation.navigate("index")}>
          <ArrowLeft size="24" color="#fff" />
        </TouchableOpacity>

        <View className="flex-row gap-5 items-center">
          <Undo size="24" color="#fff" />
          <Redo size="24" color="#fff" />

          <TouchableOpacity onPress={saveImage}>
            <Download size="24" color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 mt-9 bg-black">
        {editedImage ? (
          <Canvas style={{ width, height: imageHeight }}>
            <Image
              image={editedImage}
              x={0}
              y={0}
              width={imageWidth}
              height={imageHeight}
              fit="contain"
            />
          </Canvas>
        ) : (
          <Text className="text-lg text-gray-600 text-center">
            No image selected.
          </Text>
        )}
      </View>

      <View className=" bg-neutral-900">
        {isBrightnessVisible && (
          <View className="px-5 pb-4 pt-2 border-slate-300 border-b-2">
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={-100}
              maximumValue={100}
              step={1}
              value={brightnessValue}
              onValueChange={(value) => setBrightnessValue(value)}
              onSlidingComplete={() => handleAdjustment("brightness")}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />
            <Text className="text-white text-center mt-2 ">
              Brightness: {brightnessValue}
            </Text>
          </View>
        )}

        {isContrastVisible && (
          <View className="px-5 pb-4 pt-2 border-slate-300 border-b-2">
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={contrastValue}
              onValueChange={(value) => setContrastValue(value)}
              onSlidingComplete={() => handleAdjustment("contrast")}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />
            <Text className="text-white text-center mt-2">
              Contrast: {contrastValue}
            </Text>
          </View>
        )}

        {isSaturationVisible && (
          <View className="px-5 pb-4 pt-2 border-slate-300 border-b-2">
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={saturationValue}
              onValueChange={(value) => setSaturationValue(value)}
              onSlidingComplete={() => handleAdjustment("saturation")}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#0000FF"
            />
            <Text className="text-white text-center mt-2">
              Saturation: {saturationValue}
            </Text>
          </View>
        )}

        {intensityVisible && (
          <View className="px-5 pb-4 pt-2 flex items-center border-slate-300 border-b-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0"
            >
              {intensityTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => handleIntensityClick(tool.id)}
                  className={`flex items-center justify-center w-28 py-5 mx-6 rounded-md ${
                    selectedIntensityTool === tool.id
                      ? "bg-primary"
                      : "bg-neutral-700"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedIntensityTool === tool.id ? "#1E90FF" : "#333",
                  }}
                >
                  <Text
                    className={`text-xs text-center ${
                      selectedIntensityTool === tool.id
                        ? "text-white"
                        : "text-gray-200"
                    }`}
                  >
                    {tool.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {thresholdVisible && (
          <View className="px-5 pb-4 pt-2 flex items-center border-slate-300 border-b-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0"
            >
              {ThresholdTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => handleThresholdClick(tool.id)}
                  className={`flex items-center justify-center w-28 py-5 mx-6 rounded-md ${
                    selectedThresholdTool === tool.id
                      ? "bg-primary"
                      : "bg-neutral-700"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedThresholdTool === tool.id ? "#1E90FF" : "#333",
                  }}
                >
                  <Text
                    className={`text-xs text-center ${
                      selectedThresholdTool === tool.id
                        ? "text-white"
                        : "text-gray-200"
                    }`}
                  >
                    {tool.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {selectedTool === "Blur" && (
          <View className="px-5 pb-4 pt-2 flex items-center border-slate-300 border-b-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0"
            >
              {BlurTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => setSelectedBlurTool(tool.id)}
                  className={`flex items-center justify-center w-28 py-5 mx-6 rounded-md ${
                    selectedBlurTool === tool.id
                      ? "bg-primary"
                      : "bg-neutral-700"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedBlurTool === tool.id ? "#1E90FF" : "#333",
                  }}
                >
                  <Text
                    className={`text-xs text-center ${
                      selectedBlurTool === tool.id
                        ? "text-white"
                        : "text-gray-200"
                    }`}
                  >
                    {tool.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10, paddingHorizontal: 5 }}
            className="flex-grow-0 border-slate-300 p-3 border-b-2"
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => handleFilterClick(filter.id)}
                className={`flex items-center justify-center w-24 py-5 mx-1 rounded-md ${
                  selectedFilter === filter.id ? "bg-primary" : "bg-neutral-700"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor:
                    selectedFilter === filter.id ? "#1E90FF" : "#333",
                }}
              >
                <Text
                  className={`text-xs text-center ${
                    selectedFilter === filter.id
                      ? "text-white"
                      : "text-gray-200"
                  }`}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tools Bar Section */}
        <View className="pt-2 pb-4 bg-neutral-900 rounded-t-xl">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-grow-0"
          >
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                className={`flex items-center w-24 justify-center py-5 p-3 mx-1 rounded-xl ${
                  selectedTool === tool.id ? "bg-primary" : ""
                }`}
                onPress={tool.action}
              >
                <tool.icon size={24} color="#ffffff" />
                <Text className="mt-2 text-xs text-center text-white">
                  {tool.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ImageEditorScreen;
