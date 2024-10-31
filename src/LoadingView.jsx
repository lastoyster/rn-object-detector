/*************  ✨ Codeium Command 🌟  *************/
import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, ViewStyle, ColorValue } from 'react-native';
import { View, Text } from 'react-native-ui-lib';


interface LoadingViewProps {
  children?: ReactNode;
  message?: string;
  size?: 'small' | 'large';
  color?: ColorValue;
  messageStyle?: React.CSSProperties;
  containerStyle?: ViewStyle;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  dismissable?: boolean;
  onDismiss?: () => void;
}

const DEFAULT_PROPS = {
  size: 'large',
  color: '#007AFF',
  accessible: true,
  dismissable: false,
};

export const LoadingView = React.memo(({
  children,
  message,
  size = DEFAULT_PROPS.size,
  color = DEFAULT_PROPS.color,
  messageStyle,
  containerStyle,
  testID = 'loading-view',
  accessible = DEFAULT_PROPS.accessible,
  accessibilityLabel,
  dismissable = DEFAULT_PROPS.dismissable,
  onDismiss,
}) => {
  const defaultAccessibilityLabel = message || 'Loading, please wait';

  const handleDismiss = React.useCallback(() => {
    if (dismissable && onDismiss) {
      onDismiss();
    }
  }, [dismissable, onDismiss]);

  return (
    <View
      style={[styles.container, containerStyle]}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityRole="alert"
      onTouchEnd={handleDismiss}
    >
      <View style={styles.content}>
        {message ? (
          <Text
            style={[styles.message, messageStyle]}
            text70
            grey10
            marginB-20
            testID={`${testID}-message`}
          >
            {message}
          </Text>
        ) : null}
        
        <ActivityIndicator
          size={size}
          color={color}
          testID={`${testID}-spinner`}
        />
        
        {children && (
          <View 
            style={styles.childrenContainer}
            testID={`${testID}-children`}
          >
            {children}
          </View>
        )}
      </View>
    </View>
  );
});

// Display name for debugging
LoadingView.displayName = 'LoadingView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    minWidth: 200,
    maxWidth: '80%',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  childrenContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});


// 
/*
import { LoadingView } from './LoadingView';

const MyComponent = () => {
  return (
    <LoadingView 
      message="Loading data..."
      size="large"
      color="#007AFF"
      containerStyle={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
      onDismiss={() => console.log('Loading dismissed')}
    >
      <Text>Additional content here</Text>
    </LoadingView>
  );
};
*/
/******  0b1825db-6e62-417b-9d32-9c598473fd76  *******/