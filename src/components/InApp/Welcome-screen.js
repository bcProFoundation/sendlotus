import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import Slide from './Slide';

const WelcomeScreen = ({ slides = [], onDone }) => {
    if (!slides || !slides.length) return null;
    
    return (
        <FlatList 
         horizontal
         pagingEnabled
         data={slide} 
         keyExtractor={(item) => item.key.toString()} 
         renderItem={({item}) => <Slide item={item}/>} />
    )

}

const styles = StyleSheet.create({
})

export default WelcomeScreen;