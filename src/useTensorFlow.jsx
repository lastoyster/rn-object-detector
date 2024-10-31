import * as tf from '@tensorflow/tfjs';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text } from 'react-native-ui-lib';
import { StyleSheet } from 'react-native';

// Types
const TensorFlowModel = {
  load: () => Promise.resolve(tf.LayersModel | tf.GraphModel),
  dispose: () => void,
};

const ModelHookResult = {
  model: tf.LayersModel | tf.GraphModel | null,
  error: Error | null,
  isLoading: boolean,
};

const LoaderProps = {
  onLoad: () => void,
  onError: (error: Error) => void,
  loadingComponent: React.ReactNode,
  errorComponent: React.ReactNode,
};

// Custom error class
class TensorFlowError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'TensorFlowError';
    this.originalError = originalError;
  }
}

// Helper function to check if TensorFlow is ready
const checkTensorFlowReady = async () => {
  try {
    await tf.ready();
    // Check if GPU is available (optional)
    const backend = tf.getBackend();
    console.debug(`TensorFlow.js using backend: ${backend}`);
    return true;
  } catch (error) {
    throw new TensorFlowError('Failed to initialize TensorFlow', error);
  }
};

// Main model hook
export const useTensorFlowModel = (modelKind) => {
  const [state, setState] = useState({
    model: null,
    error: null,
    isLoading: true,
  });
  
  const isMounted = useRef(true);
  const modelRef = useRef(null);

  const cleanup = useCallback(() => {
    if (modelRef.current) {
      try {
        if (modelRef.current.dispose) {
          modelRef.current.dispose();
        }
        modelRef.current = null;
      } catch (error) {
        console.error('Error disposing model:', error);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const loadModel = async () => {
      if (!modelKind) {
        setState({ model: null, error: new Error('No model provided'), isLoading: false });
        return;
      }

      try {
        // First ensure TensorFlow is ready
        await checkTensorFlowReady();
        
        // Then load the model
        const loadedModel = await modelKind.load();
        modelRef.current = loadedModel;

        if (isMounted.current) {
          setState({
            model: loadedModel,
            error: null,
            isLoading: false,
          });
        }
      } catch (error) {
        if (isMounted.current) {
          setState({
            model: null,
            error: error instanceof Error ? error : new Error('Unknown error loading model'),
            isLoading: false,
          });
        }
      }
    };

    setState(prev => ({ ...prev, isLoading: true }));
    loadModel();

    return cleanup;
  }, [modelKind, cleanup]);

  return state;
};

// TensorFlow Loader Component
export const TensorFlowLoader = ({ onLoad, onError, loadingComponent, errorComponent }) => {
  const [status, setStatus] = useState({
    isLoaded: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await checkTensorFlowReady();
        if (isMounted) {
          setStatus({ isLoaded: true, error: null });
          onLoad?.();
        }
      } catch (error) {
        if (isMounted) {
          const tfError = error instanceof Error ? error : new Error('Unknown error');
          setStatus({ isLoaded: false, error: tfError });
          onError?.(tfError);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [onLoad, onError]);

  if (status.error) {
    return errorComponent || (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading TensorFlow: {status.error.message}</Text>
        <Text style={styles.subText}>Please check your network connection and try again.</Text>
      </View>
    );
  }

  if (!status.isLoaded) {
    return loadingComponent || (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading TensorFlow...</Text>
        <Text style={styles.subText}>This may take a few moments. Please wait.</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'red',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
