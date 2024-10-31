import round from 'lodash/round';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from 'react-native-ui-lib';

// Constants
const LAYOUT = {
  margin: 24,
  borderRadius: 20,
  padding: 8
};

const PERCENTAGE_COLORS = [
  { threshold: 40, color: '#4c6553' },
  { threshold: 30, color: '#4d8855' },
  { threshold: 20, color: '#4bad53' },
  { threshold: 15, color: '#4cdb6e' },
  { threshold: 10, color: '#6bef95' },
  { threshold: 5, color: '#cef7ae' },
  { threshold: 0, color: '#cef7ae' }
];

const PercentageText = React.memo(({ value }) => {
  const color = useMemo(() => {
    return PERCENTAGE_COLORS.find(({ threshold }) => value >= threshold)?.color || PERCENTAGE_COLORS[0].color;
  }, [value]);

  return (
    <Text style={{ color }}>
      {value} %
    </Text>
  );
});

export const PredictionList = React.memo(({ predictions = [] }) => {
  const sortedPredictions = useMemo(() => {
    return [...predictions]
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // Show only top 5 predictions for better performance
  }, [predictions]);

  if (!sortedPredictions.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {sortedPredictions.map((prediction, index) => {
        const { className, probability } = prediction;
        const percentage = round(probability * 100, 1); // Round to 1 decimal place

        return (
          <View key={`prediction-${index}`} style={styles.predictionRow}>
            <Text style={styles.className} text65>
              {className}
            </Text>
            <PercentageText value={percentage} />
          </View>
        );
      })}
    </View>
  );
});

// Prop types for better development experience
PredictionList.displayName = 'PredictionList';
PercentageText.displayName = 'PercentageText';

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    position: 'absolute',
    top: LAYOUT.margin,
    left: LAYOUT.margin,
    right: LAYOUT.margin,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: LAYOUT.padding,
    borderRadius: LAYOUT.borderRadius,
    alignItems: 'center',
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  className: {
    fontSize: 20,
    marginRight: 8,
  }
});

// Types for TypeScript support (optional)
/*
type Prediction = {
  className: string;
  probability: number;
};

type PredictionListProps = {
  predictions: Prediction[];
};

type PercentageTextProps = {
  value: number;
};
*/