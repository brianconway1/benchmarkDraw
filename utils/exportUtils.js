import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export const captureCanvas = async (viewRef) => {
  try {
    if (!viewRef.current) {
      console.error('View ref is not available');
      return null;
    }

    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    return uri;
  } catch (error) {
    console.error('Error capturing canvas:', error);
    return null;
  }
};

export const saveToGallery = async (uri) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access media library not granted');
      return false;
    }

    await MediaLibrary.createAssetAsync(uri);
    return true;
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return false;
  }
};

export const shareImage = async (uri) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.error('Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(uri);
    return true;
  } catch (error) {
    console.error('Error sharing image:', error);
    return false;
  }
};

export const exportImage = async (
  viewRef,
  saveToGalleryFlag = false
) => {
  try {
    const uri = await captureCanvas(viewRef);
    if (!uri) {
      return { success: false, error: 'Failed to capture canvas' };
    }

    if (saveToGalleryFlag) {
      const saved = await saveToGallery(uri);
      if (!saved) {
        return { success: false, error: 'Failed to save to gallery' };
      }
    }

    return { success: true, uri };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
