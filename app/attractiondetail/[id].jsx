const partsAreValid = (loc) => {
    const parts = loc.split(',').map(s => parseFloat(s.trim()));
    return parts.length === 2 && parts.every(n => !isNaN(n));
};
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { getCachedAttractions } from '@/context/dataCache';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import MapView, { Marker } from 'react-native-maps';


export default function AttractionDetail() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [attraction, setAttraction] = useState(null);
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();


    useEffect(() => {
        const fetchAttraction = async () => {
            const allAttractions = await getCachedAttractions();
            const match = allAttractions.find(a => a.id === id);
            if (match) {
                setAttraction(match);
            }
        };
        if (id) fetchAttraction();
    }, [id]);

    return (
        <ThemedView style={{ flex: 1, backgroundColor: Colors[colorScheme].pri }}>
            <View style={globalStyles.attractionImageContainer}>
                {attraction?.imageUrl ? (
                    <Image
                        source={{ uri: attraction.imageUrl }}
                        style={globalStyles.image}
                    />
                ) : (
                    <View style={[globalStyles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' }]}>
                        <ThemedText>Loading Image...</ThemedText>
                    </View>
                )}
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
                                        <ThemedText type="title">{attraction?.name || 'Loading...'}</ThemedText>
                                        <View style={globalStyles.rating}>
                                            <ThemedText type="defaultSemiBold" style={{ color: '#D97706' }}>
                                                {attraction.review || 0}
                                            </ThemedText>
                                            <Ionicons name="star" size={20} color="#FACC15" />
                                        </View>
                                    </View>
                                    <ThemedText type="small" style={{ color: Colors[colorScheme].for }}>{attraction?.description || '...'}</ThemedText>
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
                                {attraction?.location && partsAreValid(attraction.location) && (
                                    <View style={{ marginTop: 20, height: 300 }}>
                                        <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Map</ThemedText>
                                        <View style={globalStyles.heroImage}>
                                            <MapView
                                                style={{ flex: 1 }}
                                                initialRegion={{
                                                    latitude: parseFloat(attraction.location.split(',')[0]),
                                                    longitude: parseFloat(attraction.location.split(',')[1]),
                                                    latitudeDelta: 0.01,
                                                    longitudeDelta: 0.01,
                                                }}
                                            >
                                                <Marker
                                                    coordinate={{
                                                        latitude: parseFloat(attraction.location.split(',')[0]),
                                                        longitude: parseFloat(attraction.location.split(',')[1]),
                                                    }}
                                                    title={attraction.name}
                                                    description={attraction.description}
                                                />
                                            </MapView>
                                        </View>
                                    </View>
                                )}
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
            <IconSymbol name={getIconName(label)} color='#f8f8f8' />
            <ThemedText
                type="default"
                style={{ flexShrink: 1, flex: 1, marginLeft: 6, color: '#f8f8f8' }}
            >
                {label}
            </ThemedText>
        </View>
    );
};
