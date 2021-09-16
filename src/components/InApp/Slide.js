import React from "react";
import { View, StyleSheet, Dimensions } from 'react-native';

const Slide = ({item}) => {
    const {tittle} = item

    return (
        <View style={[styles.slide, { backgroundColor: '#555555' }]}>
            <Text style={styles.text}>{item.tittle}</Text>
        </View>
    )
}

const { width, height } = Dimensions.get('screen');
const styles = StyleSheet.create({
    slide:{
        width,
        height,
        justifyContent: 'center',
        alignContent: 'center'
    },
    text: {
        color: '#fff',
        fontSize: 20
    }
})

export default Slide