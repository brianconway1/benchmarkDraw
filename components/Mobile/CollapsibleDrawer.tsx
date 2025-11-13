import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';

interface CollapsibleDrawerProps {
  visible: boolean;
  position: 'left' | 'right';
  children: React.ReactNode;
  onClose?: () => void;
  width?: number;
}

const CollapsibleDrawer: React.FC<CollapsibleDrawerProps> = ({
  visible,
  position,
  children,
  onClose,
  width = 280,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = React.useRef(new Animated.Value(position === 'left' ? -width : width)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: position === 'left' ? -width : width,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width,
            [position]: 0,
            transform: [{ translateX }],
          },
        ]}
      >
        {onClose && (
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
    zIndex: 999,
  },
  header: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default CollapsibleDrawer;

