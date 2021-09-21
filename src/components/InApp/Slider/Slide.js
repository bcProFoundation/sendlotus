import React from "react";
import { View, StyleSheet, Dimensions, Text} from 'react-native';

const Slide = ({item}) => {
    const {title, des, image} = item

    return (
        <View style={[styles.slide, { backgroundColor: '#555555' }]}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.text}>{item.des}</Text>
            <img src={item.image} />
        </View>
    )
}

const { width, height } = Dimensions.get('screen');
const styles = StyleSheet.create({
    slide:{
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 20
    }
})

export default Slide