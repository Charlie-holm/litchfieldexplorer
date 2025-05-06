import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { router } from 'expo-router';


export default function AttractionDetail() {
    const { theme: colorScheme } = useThemeContext();
    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/explore')} style={styles.backIcon}>
                <IconSymbol
                    name="chevron.left" size={24} color={Colors[colorScheme].text}
                />
            </TouchableOpacity>
            <ScrollView style={styles.container}>
                <Image
                    source={require('@/assets/images/home1.jpg')}
                    style={styles.headerImage}
                />


                <View style={styles.infoCard}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Wangi Falls</Text>
                        <View style={styles.rating}>
                            <Text style={styles.ratingText}>4.9</Text>
                            <Ionicons name="star" size={20} color="#FACC15" />
                        </View>
                    </View>
                    <Text style={styles.description}>
                        A large plunge pool with shady grassed areas
                    </Text>

                    <Text style={styles.sectionTitle}>Status</Text>
                    {renderStatusRow('Campground', 'Open')}
                    {renderStatusRow('Loop walk', 'Open')}
                    {renderStatusRow('Picnic area', 'Open')}
                    {renderStatusRow('Cafe', 'Closed')}
                    {renderStatusRow('Swimming', 'Closed')}

                    <Text style={styles.sectionTitle}>Facilities</Text>
                    <View style={styles.facilityGrid}>
                        {renderFacility('BBQ - Gas', 'grill')}
                        {renderFacility('Coffee', 'coffee')}
                        {renderFacility('ECD', 'battery')}
                        {renderFacility('Free wi-fi', 'wifi')}
                        {renderFacility('Information signs', 'information')}
                        {renderFacility('Public Toilet', 'toilet')}
                        {renderFacility('Water', 'water')}
                        {renderFacility('Caravan', 'bus')}
                        {renderFacility('Disabled access', 'wheelchair-accessibility')}
                        {renderFacility('Food', 'silverware')}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const renderStatusRow = (label, status) => (
    <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusValue}>{status}</Text>
    </View>
);

const renderFacility = (label, iconName) => (
    <View style={styles.facilityItem} key={label}>
        <MaterialCommunityIcons name={iconName} size={20} color="#444" />
        <Text style={styles.facilityText}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerImage: { width: '100%', height: 300 },
    backIcon: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        elevation: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 6,
    },
    infoCard: {
        marginTop: -40,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
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
        gap: 16,
        marginTop: 10,
    },
    facilityItem: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 10,
        marginBottom: 8,
    },
    facilityText: { marginLeft: 8, fontSize: 13, color: '#333' },
});