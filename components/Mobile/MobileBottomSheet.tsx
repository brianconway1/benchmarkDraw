import React, { useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  GestureResponderHandlers,
} from 'react-native';
import { useWindowDimensions } from 'react-native';


interface MobileBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage of screen height (0.3 = 30%)
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [0.5, 0.8], // Default: 50% and 80%
}) => {
  const { height } = useWindowDimensions();
  const translateY = React.useRef(new Animated.Value(height)).current;
  const panY = React.useRef(new Animated.Value(0)).current;
  
  // Calculate initial snap position (largest snap point)
  const initialSnap = height * (1 - Math.max(...snapPoints));
  
  useEffect(() => {
    if (visible) {
      // Start off-screen, then animate to initial snap position
      translateY.setValue(height);
      Animated.spring(translateY, {
        toValue: initialSnap,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, height, initialSnap]);

  const handleGestureEnd = (gestureState: any) => {
    const currentY = (translateY as any)._value + gestureState.dy;
    const snapToValues = snapPoints.map((point) => height * (1 - point));
    const snapTo = snapToValues.reduce((prev, curr) => 
      (Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev)
    );

    if (gestureState.dy > 150 || currentY > height * 0.8) {
      // Close if dragged down significantly (80% threshold)
      onClose();
    } else {
      // Snap to nearest point
      Animated.spring(translateY, {
        toValue: snapTo,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }

    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderGrant: () => {
      panY.setValue(0);
      (translateY as any).setOffset((translateY as any)._value);
    },
    onPanResponderMove: (_, gestureState) => {
      panY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      (translateY as any).flattenOffset();
      handleGestureEnd(gestureState);
    },
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            {
              height: height * Math.max(...snapPoints), // Set explicit height to largest snap point
              maxHeight: height * 0.95, // Cap at 95% of screen height
              transform: [
                {
                  translateY: Animated.add(translateY, panY).interpolate({
                    inputRange: [-height, 0],
                    outputRange: [-height, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
          {...(panResponder.panHandlers as any)}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
});

export default MobileBottomSheet;

