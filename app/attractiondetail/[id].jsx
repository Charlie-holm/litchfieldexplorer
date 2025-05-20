import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';


export default function AttractionDetail() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [attraction, setAttraction] = useState(null);
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();


    useEffect(() => {
        const fetchAttraction = async () => {
            const ref = doc(db, 'attractions', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setAttraction(snap.data());
            }
        };
        if (id) fetchAttraction();
    }, [id]);

    return (
        <ThemedView style={{ flex: 1, backgroundColor: Colors[colorScheme].pri }}>
            <View style={globalStyles.attractionImageContainer}>
                <Image
                    source={{ uri: attraction?.imageUrl }}
                    style={globalStyles.image}
                />
                <TouchableOpacity
                    onPress={() => {
                        router.back();
                    }}
                    style={globalStyles.backIcon}
                >
                    <IconSymbol name="chevron.left" color={'#f8f8f8'} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, zIndex: 2 }}>
                <ScrollView
                    style={{ paddingTop: 300 }}
                    bounces={false}
                >
                    {attraction && (
                        <>
                            <View style={globalStyles.infoCard}>
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                        <ThemedText type="title">{attraction.name}</ThemedText>
                                        <View style={globalStyles.rating}>
                                            <ThemedText type="defaultSemiBold" style={{ color: '#D97706' }}>
                                                {attraction.review || 0}
                                            </ThemedText>
                                            <Ionicons name="star" size={20} color="#FACC15" />
                                        </View>
                                    </View>
                                    <ThemedText type="small" style={{ color: Colors[colorScheme].for }}>{attraction.description}</ThemedText>
                                </View>
                                <View>
                                    <ThemedText type="subtitle">Status</ThemedText>
                                    {attraction.status?.map((s, idx) => {
                                        const [label, value] = s.split(' - ');
                                        return renderStatusRow(label, value, idx);
                                    })}
                                </View>
                                <View>
                                    <ThemedText type="subtitle">Facilities</ThemedText>
                                    <View style={globalStyles.facilityGrid}>
                                        {attraction.facilities?.map((f, idx) => renderFacility(f, 'checkbox-marked', idx, colorScheme))}
                                    </View>
                                    <View style={globalStyles.facilityGrid}>
                                        {attraction.ac?.map((f, idx) => renderFacility(f, 'checkbox-marked', idx, colorScheme))}
                                    </View>
                                </View>
                                <View>
                                    <ThemedText type="subtitle">Activities</ThemedText>
                                    <View style={globalStyles.facilityGrid}>
                                        {attraction.activities?.map((a, idx) => renderFacility(a, 'checkbox-marked', idx, colorScheme))}
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </ThemedView >
    );
}

const renderStatusRow = (label, status, key) => (
    <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, }}>
        <ThemedText type="default">{label}</ThemedText>
        <ThemedText type="defaultSemiBold">{status}</ThemedText>
    </View>
);

const renderFacility = (label, iconName = 'checkbox-marked', key, colorScheme) => {
    const getIconName = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('toilet')) return 'toilet';
        if (lower.includes('coffee')) return 'cup.and.saucer';
        if (lower.includes('parking') || lower.includes('caravan')) return 'car';
        if (lower.includes('bbq')) return 'fork.knife';
        if (lower.includes('picnic')) return 'basket';
        if (lower.includes('water')) return 'drop';
        if (lower.includes('info')) return 'info.circle';
        if (lower.includes('lookout') || lower.includes('sightseeing') || lower.includes('heritage')) return 'eye';
        if (lower.includes('wi-fi')) return 'wifi';
        if (lower.includes('disabled')) return 'figure.roll';
        if (lower.includes('firepit') || lower.includes('fire')) return 'flame';
        if (lower.includes('shower')) return 'shower';
        if (lower.includes('phone')) return 'phone';
        if (lower.includes('camping') || lower.includes('campground') || lower.includes('camper')) return 'tent';
        if (lower.includes('food')) return 'fork.knife';
        if (lower.includes('4wd')) return 'car.2';
        if (lower.includes('ecd')) return 'bolt';
        if (lower.includes('hosting')) return 'person.2';
        if (lower.includes('walking')) return 'figure.walk';
        if (lower.includes('swimming')) return 'figure.wave';
        return 'checkmark.circle';
    };

    return (
        <View
            style={{
                width: '48.5%',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors[colorScheme].sec,
                padding: 5,
                paddingVertical: 15,
                borderRadius: 10,
            }}
            key={key}
        >
            <IconSymbol name={getIconName(label)} />
            <ThemedText
                type="default"
                style={{ flexShrink: 1, flex: 1, marginLeft: 6 }}
            >
                {label}
            </ThemedText>
        </View>
    );
};
