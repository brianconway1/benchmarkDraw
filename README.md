# Benchmark Draw

A React Native mobile app for creating football drill diagrams with drawing tools, draggable icons, and animation capabilities.

## Features

- **Background Selection**: Choose from white background, pitch_blank.png, pitch_full.png, or pitch_half.png
- **Draggable Icons**: 
  - Players (Team 1 and Team 2) with customizable colors, styles (solid/striped), and labels
  - Cones with customizable color and size
  - Goal Posts
  - Ball
- **Drawing Tools**:
  - Straight lines
  - Curved lines
  - Free draw
  - Rectangles (filled or outline)
  - Line properties: color, thickness, dash patterns, arrow endpoints
- **Editing Tools**:
  - Select, move, resize, reshape
  - Delete
  - Copy/Paste
  - Undo/Redo
- **Animation**: Create frame sequences and export as GIF or video
- **Screenshot**: Capture canvas and save to gallery
- **Responsive**: Works on both phones and tablets (iOS and Android)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Project Structure

```
benchmark-draw/
├── app/
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Main app screen
├── components/
│   ├── Canvas/
│   │   └── DrawingCanvas.tsx
│   ├── Icons/
│   │   ├── PlayerIcon.tsx
│   │   ├── ConeIcon.tsx
│   │   ├── GoalPostIcon.tsx
│   │   └── BallIcon.tsx
│   ├── Tools/
│   │   └── Toolbar.tsx
│   └── Panels/
│       ├── LeftPanel.tsx
│       ├── RightPanel.tsx
│       └── BottomPanel.tsx
├── hooks/
│   ├── useDrawing.ts
│   ├── useSelection.ts
│   ├── useHistory.ts
│   └── usePanZoom.ts
├── utils/
│   ├── drawingUtils.ts
│   ├── geometryUtils.ts
│   └── exportUtils.ts
├── types/
│   └── index.ts
└── store/
    └── appStore.ts
```

## Technologies

- **Expo**: React Native framework
- **react-native-svg**: SVG rendering
- **react-native-gesture-handler**: Touch gesture handling
- **react-native-reanimated**: Animations
- **react-native-view-shot**: Screenshot functionality
- **zustand**: State management

## Development

The app is built with TypeScript and uses Expo's managed workflow. All images are bundled with the app in the `assets/images/` directory.

## License

Private - Bench Mark Sports
