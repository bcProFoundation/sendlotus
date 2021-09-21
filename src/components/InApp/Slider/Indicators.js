import React from "react";
import { View, StyleSheet } from 'react-native';

const Indicators = ({indicatorCount}) => {
    if (!indicatorCount || typeof indicatorCount !== 'number' ) return null;

    let indicators = [];
    for (let i = 0; i < indicatorCount; i++) {
        indicators.push(i);
    }
    return indicators.map(indicator => <View key={indicators.toString()} style={styles.indicator} />)
}

const styles = StyleSheet.create({
    indicator: {
        width: 10,
        height: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        marginHorizontal: 5,
    }
})

export default Indicators;