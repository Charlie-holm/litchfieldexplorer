import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';


export default function AttractionDetail() {
    const { theme: colorScheme } = useThemeContext(); const globalStyles = useGlobalStyles();


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
        <View style={{ flex: 1 }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, zIndex: 1 }}>
                <Image
                    source={{ uri: attraction?.imageUrl }}
                    style={StyleSheet.absoluteFillObject}
                />
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backIcon}>
                    <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].pri} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, zIndex: 2 }}>
                <ScrollView style={{ flex: 1, paddingTop: 300 }}>
                    {attraction && (
                        <>
                            <View style={globalStyles.infoCard}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.title}>{attraction.name}</Text>
                                    <View style={styles.rating}>
                                        <Text style={styles.ratingText}>{attraction.review || 0}</Text>
                                        <Ionicons name="star" size={20} color="#FACC15" />
                                    </View>
                                </View>
                                <Text style={styles.description}>{attraction.description}</Text>

                                <Text style={styles.sectionTitle}>Status</Text>
                                {attraction.status?.map((s, idx) => {
                                    const [label, value] = s.split(' - ');
                                    return renderStatusRow(label, value, idx);
                                })}

                                <Text style={styles.sectionTitle}>Facilities</Text>
                                <View style={styles.facilityGrid}>
                                    {attraction.facilities?.map((f, idx) => renderFacility(f, 'checkbox-marked', idx))}
                                </View>
                                <View style={styles.facilityGrid}>
                                    {attraction.ac?.map((f, idx) => renderFacility(f, 'checkbox-marked', idx))}
                                </View>
                                <Text style={styles.sectionTitle}>Activities</Text>
                                <View style={styles.facilityGrid}>
                                    {attraction.activities?.map((a, idx) => renderFacility(a, 'checkbox-marked', idx))}
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const renderStatusRow = (label, status, key) => (
    <View key={key} style={styles.statusRow}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusValue}>{status}</Text>
    </View>
);

const renderFacility = (label, iconName = 'checkbox-marked', key) => (
    <View style={styles.facilityItem} key={key}>
        <MaterialCommunityIcons name={iconName} size={20} color="#444" />
        <Text style={styles.facilityText}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, },
    headerImage: { width: '100%', height: 300 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    ratingText: { fontWeight: 'bold', marginRight: 4 },
    description: { marginTop: 8, fontSize: 14, color: '#555' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    statusLabel: { fontSize: 14, color: '#333' },
    statusValue: { fontSize: 14, fontWeight: 'bold' },
    facilityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    facilityItem: {
        width: '48.5%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 5,
        paddingVertical: 15,
        borderRadius: 10,
    },
    facilityText: { marginLeft: 8, fontSize: 13, color: '#333' },
});