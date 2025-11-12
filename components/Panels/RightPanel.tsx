import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, TextInput } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { PlayerTeam, ConeColor, ConeSize, PlayerStyle, LabelType } from '../../types';
import Svg, { Circle, Polygon, Path, Rect, Defs, Pattern } from 'react-native-svg';

const ICON_SIZE = 30;

interface RightPanelProps {
  onIconDragStart?: (type: string, team?: PlayerTeam) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ onIconDragStart }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Player settings
  const [playerColorTeam1, setPlayerColorTeam1] = useState('#2563eb');
  const [playerColorTeam2, setPlayerColorTeam2] = useState('#dc2626');
  const [playerStyleTeam1, setPlayerStyleTeam1] = useState<PlayerStyle>('solid');
  const [playerStyleTeam2, setPlayerStyleTeam2] = useState<PlayerStyle>('solid');
  const [playerStripeColorTeam1, setPlayerStripeColorTeam1] = useState('white');
  const [playerStripeColorTeam2, setPlayerStripeColorTeam2] = useState('white');
  const [playerLabelTypeTeam1, setPlayerLabelTypeTeam1] = useState<LabelType>('number');
  const [playerLabelTypeTeam2, setPlayerLabelTypeTeam2] = useState<LabelType>('number');
  const [playerCustomTextTeam1, setPlayerCustomTextTeam1] = useState('');
  const [playerCustomTextTeam2, setPlayerCustomTextTeam2] = useState('');
  const [nextPlayerNumberTeam1, setNextPlayerNumberTeam1] = useState(1);
  const [nextPlayerNumberTeam2, setNextPlayerNumberTeam2] = useState(2);

  // Cone settings
  const [coneColor, setConeColor] = useState<ConeColor>('orange');
  const [coneSize, setConeSize] = useState<ConeSize>('medium');

  const [showPlayer1Settings, setShowPlayer1Settings] = useState(false);
  const [showPlayer2Settings, setShowPlayer2Settings] = useState(false);
  const [showConeSettings, setShowConeSettings] = useState(false);

  const playerColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Yellow', value: '#ca8a04' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const coneColors: { name: string; value: ConeColor }[] = [
    { name: 'White', value: 'white' },
    { name: 'Black', value: 'black' },
    { name: 'Orange', value: 'orange' },
    { name: 'Red', value: 'red' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Green', value: 'green' },
    { name: 'Blue', value: 'blue' },
  ];

  const handleAddPlayer = (team: PlayerTeam) => {
    const color = team === 'team1' ? playerColorTeam1 : playerColorTeam2;
    const style = team === 'team1' ? playerStyleTeam1 : playerStyleTeam2;
    const stripeColor = team === 'team1' ? playerStripeColorTeam1 : playerStripeColorTeam2;
    const labelType = team === 'team1' ? playerLabelTypeTeam1 : playerLabelTypeTeam2;
    const customText = team === 'team1' ? playerCustomTextTeam1 : playerCustomTextTeam2;
    const nextNumber = team === 'team1' ? nextPlayerNumberTeam1 : nextPlayerNumberTeam2;

    let label = '';
    if (labelType === 'number') {
      label = nextNumber.toString();
      if (team === 'team1') {
        setNextPlayerNumberTeam1((prev) => prev + 1);
      } else {
        setNextPlayerNumberTeam2((prev) => prev + 1);
      }
    } else if (labelType === 'text') {
      label = customText;
    }

    useAppStore.getState().addPlayer({
      x: 400,
      y: 300,
      team,
      color,
      style,
      stripeColor,
      labelType,
      label,
    });
  };

  const handleAddCone = () => {
    useAppStore.getState().addCone({
      x: 400,
      y: 300,
      color: coneColor,
      size: coneSize,
    });
  };

  const handleAddGoalPost = () => {
    useAppStore.getState().addGoalPost({
      x: 400,
      y: 300,
    });
  };

  const handleAddBall = () => {
    useAppStore.getState().addBall({
      x: 400,
      y: 300,
    });
  };

  const renderPlayerIcon = (color: string, style: PlayerStyle, stripeColor: string, label: string) => {
    const radius = ICON_SIZE / 2;
    const patternId = `stripes-${color}-${stripeColor}`;
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}>
        <Defs>
          <Pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
            <Rect width="4" height="4" fill={color} />
            <Rect width="2" height="4" fill={stripeColor} />
          </Pattern>
        </Defs>
        {style === 'striped' ? (
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 1}
            fill={`url(#${patternId})`}
            stroke="#000000"
            strokeWidth="1"
          />
        ) : (
          <Circle cx={radius} cy={radius} r={radius - 1} fill={color} stroke="#000000" strokeWidth="1" />
        )}
      </Svg>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isTablet
          ? {
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: [{ translateY: -200 }],
              width: 120,
            }
          : {
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 4,
              flexWrap: 'wrap',
            },
      ]}
    >
      {/* Team 1 Player */}
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleAddPlayer('team1')}
          onLongPress={() => setShowPlayer1Settings(true)}
        >
          {renderPlayerIcon(playerColorTeam1, playerStyleTeam1, playerStripeColorTeam1, nextPlayerNumberTeam1.toString())}
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Team 1</Text>
      </View>

      {/* Team 2 Player */}
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleAddPlayer('team2')}
          onLongPress={() => setShowPlayer2Settings(true)}
        >
          {renderPlayerIcon(playerColorTeam2, playerStyleTeam2, playerStripeColorTeam2, nextPlayerNumberTeam2.toString())}
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Team 2</Text>
      </View>

      {/* Cone */}
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleAddCone}
          onLongPress={() => setShowConeSettings(true)}
        >
          <Svg width={ICON_SIZE} height={ICON_SIZE}>
            <Polygon
              points={`${ICON_SIZE / 2},5 ${ICON_SIZE - 5},${ICON_SIZE - 5} 5,${ICON_SIZE - 5}`}
              fill={coneColor}
              stroke="#000000"
              strokeWidth="2"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Cone</Text>
      </View>

      {/* Goal Post */}
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleAddGoalPost}>
          <Svg width={ICON_SIZE} height={ICON_SIZE}>
            <Rect x={5} y={5} width={3} height={ICON_SIZE - 5} fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
            <Rect x={ICON_SIZE - 8} y={5} width={3} height={ICON_SIZE - 5} fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
            <Rect x={5} y={5} width={ICON_SIZE - 10} height={3} fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Goal</Text>
      </View>

      {/* Ball */}
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleAddBall}>
          <Svg width={ICON_SIZE} height={ICON_SIZE}>
            <Circle cx={ICON_SIZE / 2} cy={ICON_SIZE / 2} r={ICON_SIZE / 2 - 2} fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            <Path
              d={`M ${ICON_SIZE / 2},${ICON_SIZE / 2 - 5} L ${ICON_SIZE / 2 + 3},${ICON_SIZE / 2 - 1} L ${ICON_SIZE / 2 + 4},${ICON_SIZE / 2 + 3} L ${ICON_SIZE / 2 - 4},${ICON_SIZE / 2 + 3} L ${ICON_SIZE / 2 - 3},${ICON_SIZE / 2 - 1} Z`}
              fill="#000000"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Ball</Text>
      </View>

      {/* Settings Modals */}
      <Modal visible={showPlayer1Settings} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Team 1 Settings</Text>
            {/* Add settings controls here */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPlayer1Settings(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPlayer2Settings} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Team 2 Settings</Text>
            {/* Add settings controls here */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPlayer2Settings(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showConeSettings} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cone Settings</Text>
            {/* Add settings controls here */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowConeSettings(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 4,
  },
  iconButton: {
    padding: 8,
  },
  iconLabel: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default RightPanel;

