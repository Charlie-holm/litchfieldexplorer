import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const innerDimension = 300;

export const Overlay = () => {
    return (
        <View style={styles.container}>
            <View style={styles.topOverlay} />
            <View style={styles.middleRow}>
                <View style={styles.sideOverlay} />
                <View style={styles.transparentBox} />
                <View style={styles.sideOverlay} />
            </View>
            <View style={styles.bottomOverlay} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        width: width,
        height: (height - innerDimension) / 2,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: (height - innerDimension) / 2,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleRow: {
        flexDirection: 'row',
    },
    sideOverlay: {
        width: (width - innerDimension) / 2,
        height: innerDimension,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    transparentBox: {
        width: innerDimension,
        height: innerDimension,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'white',
    },
});

export default Overlay;