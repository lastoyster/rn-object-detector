// ModelView.js
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Camera } from 'expo-camera';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

// Custom Components
import { CustomTensorCamera } from './CustomTensorCamera';
import { LoadingView } from './LoadingView';
import { PredictionList } from './PredictionList';
import { useTensorFlowModel } from './useTensorFlow';

// Constants
const CAMERA_CONFIG = {
  type: Camera.Constants.Type.back,
  autorender: true
};

const ModelCamera = React.memo(({ model, onPredictionsUpdate }) => {
  const rafRef = useRef(null);
  const { width } = useWindowDimensions();

  const handleImageProcessing = useCallback(async (nextImageTensor) => {
    try {
      const predictions = await model.classify(nextImageTensor);
      onPredictionsUpdate(predictions);
    } catch (error) {
      console.error('Image processing error:', error);
    }
  }, [model, onPredictionsUpdate]);

  const processLoop = useCallback((images) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (nextImageTensor) {
        await handleImageProcessing(nextImageTensor);
        rafRef.current = requestAnimationFrame(() => loop());
      }
    };
    loop();
  }, [handleImageProcessing]);

  // Cleanup animation frame on unmount
  React.useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const cameraProps = useMemo(() => ({
    width,
    style: styles.camera,
    ...CAMERA_CONFIG,
    onReady: processLoop
  }), [width, processLoop]);

  return <CustomTensorCamera {...cameraProps} />;
});

export const ModelView = () => {
  const model = useTensorFlowModel(mobilenet);
  const [predictions, setPredictions] = useState([]);

  if (!model) {
    return <LoadingView message="Loading TensorFlow model" />;
  }

  return (
    <View style={styles.container}>
      <PredictionList predictions={predictions} />
      <View style={styles.cameraContainer}>
        <ModelCamera 
          model={model} 
          onPredictionsUpdate={setPredictions} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center'
  },
  cameraContainer: {
    borderRadius: 20,
    overflow: 'hidden'
  },
  camera: {
    zIndex: 0
  }
});