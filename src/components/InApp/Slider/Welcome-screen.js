import React from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native-web';
import Indicators from './Indicators'
import Slide from './Slide';

const WelcomeScreen = ({ slides = [], onDone }) => {
    if (!slides || !slides.length) return null;
    
    return (
        <>
            <FlatList 
                horizontal
                pagingEnabled
                data={slides} 
                keyExtractor={(item) => item.key.toString()} 
                renderItem={({item}) => <Slide item={item}/>} 
            />
            <View style={styles.indicatorContainner}>
                <Indicators indicatorCount={slides.length} />
            </View>
        </>
    )
}

const { width } = Dimensions.get('screen');
const styles = StyleSheet.create({
    indicatorContainner: {
        position: 'absolute',
        width,
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    
});

export default WelcomeScreen;