import React from 'react';
import { View, Modal, Pressable, ScrollView, TextInput, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import { useThemeContext } from '@/context/ThemeProvider';


export default function FormModal({
    mode,
    visible,
    onClose,
    editingItem,
    onSave,
    onDelete,
    form,
    setForm,
    uploading,
    handlePickImage,
    showCategoryPicker,
    setShowCategoryPicker,
    errorMsg
}) {
    const globalStyles = useGlobalStyles();
    const { theme: colorScheme } = useThemeContext();

    return (
        <>
            {mode === 'attraction' && (
                <Modal visible={visible} transparent animationType="fade">
                    <View style={globalStyles.overlay}>
                        <Pressable
                            onPress={onClose}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />
                        <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                        <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                            <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
                        </Pressable>
                        <View style={globalStyles.overlayContent}>
                            <ScrollView>
                                {['name', 'description', 'review', 'location'].map((field) => (
                                    <TextInput
                                        key={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        placeholderTextColor={Colors[colorScheme].tri}
                                        value={form[field]}
                                        onChangeText={(text) => {
                                            setForm(prev => ({ ...prev, [field]: text }));
                                        }}
                                        keyboardType={field === 'review' ? 'decimal-pad' : 'default'}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                    />
                                ))}
                                <ThemedText type="defaultSemiBold" style={{ marginBottom: 5 }}>Status</ThemedText>
                                {(form.statusEntries || []).map((entry, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <TextInput
                                            placeholder="Status label"
                                            placeholderTextColor={Colors[colorScheme].tri}
                                            value={entry.label}
                                            onChangeText={(text) => {
                                                const updated = [...form.statusEntries];
                                                updated[index].label = text;
                                                setForm(prev => ({ ...prev, statusEntries: updated }));
                                            }}
                                            style={[globalStyles.thinInputTextBox, { marginRight: 10, flex: 1 }]}
                                        />
                                        <Pressable
                                            onPress={() => {
                                                const updated = [...form.statusEntries];
                                                updated[index].open = !updated[index].open;
                                                setForm(prev => ({ ...prev, statusEntries: updated }));
                                            }}
                                            style={[globalStyles.smallPillButton, { backgroundColor: entry.open ? 'green' : 'red', width: 90 }]}
                                        >
                                            <ThemedText style={{ color: 'white' }}>{entry.open ? 'Open' : 'Closed'}</ThemedText>
                                        </Pressable>
                                    </View>
                                ))}
                                <Pressable
                                    onPress={() => {
                                        setForm(prev => ({
                                            ...prev,
                                            statusEntries: [...(prev.statusEntries || []), { label: '', open: true }]
                                        }));
                                    }}
                                    style={[globalStyles.smallPillButton, { width: '100%', marginBottom: 10, backgroundColor: Colors[colorScheme].sec }]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ textAlign: 'center', color: 'white' }}>Add Status Label</ThemedText>
                                </Pressable>
                                <ThemedText type="defaultSemiBold" style={{ marginBottom: 5 }}>Facilities</ThemedText>
                                {[
                                    'BBQ - Gas',
                                    'BBQ - Wood',
                                    'Camper Trailers',
                                    'Coffee',
                                    'ECD',
                                    'Free Wi-fi',
                                    'Information Sign',
                                    'Public Toilet',
                                    'Water',
                                    'Caravan',
                                    'Disabled Access',
                                    'Food',
                                    'Firepit',
                                    'Phone',
                                    'Shower',
                                    'Heritage'
                                ].map(option => (
                                    <Pressable
                                        key={option}
                                        onPress={() => {
                                            const updated = form.facilities?.includes(option)
                                                ? form.facilities.filter(f => f !== option)
                                                : [...(form.facilities || []), option];
                                            setForm(prev => ({ ...prev, facilities: updated }));
                                        }}
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}
                                    >
                                        {form.facilities?.includes(option) ? (
                                            <IconSymbol
                                                name="checkmark"
                                                size={18}
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderWidth: 1,
                                                    textAlign: 'center',
                                                }}
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderWidth: 1,
                                                }}
                                            />
                                        )}
                                        <ThemedText type="default">{option}</ThemedText>
                                    </Pressable>
                                ))}
                                <ThemedText type="defaultSemiBold" style={{ marginTop: 10, marginBottom: 5 }}>Activities</ThemedText>
                                {[
                                    '4WD',
                                    'Campground Hosting',
                                    'Camping',
                                    'Picnic',
                                    'Sightseeing',
                                    'Swimming',
                                    'Walking'
                                ].map(option => (
                                    <Pressable
                                        key={option}
                                        onPress={() => {
                                            const updated = form.activities?.includes(option)
                                                ? form.activities.filter(a => a !== option)
                                                : [...(form.activities || []), option];
                                            setForm(prev => ({ ...prev, activities: updated }));
                                        }}
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}
                                    >
                                        {form.activities?.includes(option) ? (
                                            <IconSymbol
                                                name="checkmark"
                                                size={18}
                                                color={Colors[colorScheme].text}
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderWidth: 1,
                                                    textAlign: 'center',
                                                }}
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderWidth: 1,
                                                }}
                                            />
                                        )}
                                        <ThemedText type="default">{option}</ThemedText>
                                    </Pressable>
                                ))}
                                {form.imageUrl ? (
                                    <View style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, marginBottom: 10, padding: 2 }}>
                                        <Image
                                            source={{ uri: form.imageUrl }}
                                            style={{ width: '100%', height: 180, borderRadius: 8 }}
                                            resizeMode="cover"
                                        />
                                    </View>
                                ) : null}
                                <Pressable
                                    onPress={handlePickImage}
                                    style={[globalStyles.smallPillButton, { width: '100%', backgroundColor: Colors[colorScheme].sec }]}
                                >
                                    <ThemedText type="default" style={{ color: '#fff' }}>
                                        {uploading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <ThemedText type="default" style={{ color: '#fff' }}>
                                                Edit Image
                                            </ThemedText>
                                        )}
                                    </ThemedText>
                                </Pressable>
                                <Pressable
                                    onPress={onSave}
                                    style={[globalStyles.smallPillButton, { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                </Pressable>
                                {editingItem && (
                                    <Pressable
                                        onPress={onDelete}
                                        style={[globalStyles.smallPillButton, { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }]}
                                    >
                                        <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                    </Pressable>
                                )}
                            </ScrollView>
                        </View>
                    </View >
                </Modal >
            )
            }
            {
                mode === 'product' && (
                    <Modal visible={visible} transparent animationType="fade">
                        <View style={globalStyles.overlay}>
                            <Pressable
                                onPress={onClose}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            />
                            <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                            <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                                <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
                            </Pressable>
                            <View style={globalStyles.overlayContent}>
                                <ScrollView contentContainerStyle={{ padding: 20 }}>
                                    {['name', 'price', 'description'].map((field) =>
                                        field === 'price' ? (
                                            <TextInput
                                                key={field}
                                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                placeholderTextColor={Colors[colorScheme].tri}
                                                value={form[field]}
                                                onChangeText={(text) => {
                                                    const floatOnly = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                                                    setForm(prev => ({ ...prev, price: floatOnly }));
                                                }}
                                                style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                                keyboardType="decimal-pad"
                                            />
                                        ) : (
                                            <TextInput
                                                key={field}
                                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                placeholderTextColor={Colors[colorScheme].tri}
                                                value={form[field]}
                                                onChangeText={(text) => setForm(prev => ({ ...prev, [field]: text }))}
                                                style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                            />
                                        )
                                    )}

                                    <ThemedText type="defaultSemiBold">Size & Color Inventory</ThemedText>

                                    <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 6 }}>
                                        {form.category !== 'souvenirs' && (
                                        <ThemedText type="default" style={{ flex: 1 }}>Size</ThemedText>
                                        )}
                                        <ThemedText type="default" style={{ flex: 1 }}>Color</ThemedText>
                                        <ThemedText type="default" style={{ flex: 1 }}>Qty</ThemedText>
                                        <Text style={{ width: 30 }} />
                                    </View>

                                   {(form.inventory || []).map((entry, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                            {form.category !== 'souvenirs' ? (
                                                <TextInput
                                                    placeholder="Size"
                                                    placeholderTextColor={Colors[colorScheme].tri}
                                                    value={entry.size}
                                                    onChangeText={(text) => {
                                                        const updated = [...form.inventory];
                                                        updated[idx].size = text;
                                                        setForm(prev => ({ ...prev, inventory: updated }));
                                                    }}
                                                     style={{ flex: 1, marginRight: 4, color: Colors[colorScheme].highlight }}
                                                />
                                            ) : null}
                                            <TextInput
                                                placeholder="Color"
                                                placeholderTextColor={Colors[colorScheme].tri}
                                                value={entry.color}
                                                onChangeText={(text) => {
                                                    const updated = [...form.inventory];
                                                    updated[idx].color = text;
                                                    setForm(prev => ({ ...prev, inventory: updated }));
                                                }}
                                                style={{ flex: 1, marginRight: 4, color: Colors[colorScheme].highlight, }}
                                            />
                                            <TextInput
                                                placeholder="Qty"
                                                placeholderTextColor={Colors[colorScheme].tri}
                                                value={entry.quantity?.toString() || ''}
                                                onChangeText={(text) => {
                                                    const updated = [...form.inventory];
                                                    updated[idx].quantity = parseInt(text) || 0;
                                                    setForm(prev => ({ ...prev, inventory: updated }));
                                                }}
                                                keyboardType="numeric"
                                                style={{ flex: 1, marginRight: 4, color: Colors[colorScheme].highlight, }}
                                            />
                                            <Pressable onPress={() => {
                                                const updated = [...form.inventory];
                                                updated.splice(idx, 1);
                                                setForm(prev => ({ ...prev, inventory: updated }));
                                            }}>
                                                <IconSymbol name="xmark" size={20} />
                                            </Pressable>
                                        </View>
                                        ))}

                                    <Pressable
                                        onPress={() => {
                                            setForm(prev => ({
                                                ...prev,
                                                inventory: [...(prev.inventory || []), { size: '', color: '', quantity: 0 }]
                                            }));
                                        }}
                                        style={[globalStyles.smallPillButton, { width: '100%', marginBottom: 10, backgroundColor: Colors[colorScheme].sec }]}
                                    >
                                        <ThemedText type="default" style={{ color: '#fff' }}>Add Row</ThemedText>
                                    </Pressable>
                                    <ThemedText type="defaultSemiBold">Category</ThemedText>
                                    <Pressable
                                        onPress={() => setShowCategoryPicker(true)}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            borderRadius: 6,
                                            padding: 10,
                                            marginBottom: 10,
                                            backgroundColor: '#f9f9f9'
                                        }}
                                    >
                                        <Text>{form.category ? form.category : 'Category...'}</Text>
                                    </Pressable>

                                    <Modal
                                        visible={showCategoryPicker}
                                        transparent
                                        animationType="fade"
                                        onRequestClose={() => setShowCategoryPicker(false)}
                                    >
                                        <Pressable style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000099' }} onPress={() => setShowCategoryPicker(false)}>
                                            <View style={{ borderRadius: 8, backgroundColor: 'white', padding: 10, height: 200, width: '80%', alignSelf: 'center' }}>
                                                <Picker
                                                    selectedValue={form.category}
                                                    onValueChange={(value) => {
                                                        setForm(prev => ({ ...prev, category: value }));
                                                        setShowCategoryPicker(false);
                                                    }}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <Picker.Item label="Category..." value="" />
                                                    <Picker.Item label="Souvenirs" value="souvenirs" />
                                                    <Picker.Item label="Dress" value="dress" />
                                                    <Picker.Item label="T-Shirts" value="t-shirts" />
                                                    <Picker.Item label="Pants" value="pants" />
                                                    <Picker.Item label="Socks" value="socks" />
                                                    <Picker.Item label="Hats" value="hats" />
                                                </Picker>
                                            </View>
                                        </Pressable>
                                    </Modal>

                                    {form.imageUrl ? (
                                        <View style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, marginBottom: 10, padding: 2 }}>
                                            <Image
                                                source={{ uri: form.imageUrl }}
                                                style={{ width: '100%', height: 180, borderRadius: 8 }}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ) : null}

                                    <Pressable
                                        onPress={handlePickImage}
                                        style={[globalStyles.smallPillButton, { width: '100%', backgroundColor: Colors[colorScheme].sec }]}
                                    >
                                        <ThemedText type="default" style={{ color: '#fff' }}>{uploading ? "Uploading..." : "Edit Image"}</ThemedText>
                                    </Pressable>

                                    {errorMsg ? (
                                        <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{errorMsg}</Text>
                                    ) : null}

                                    <View style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
                                        <Pressable
                                            onPress={onSave}
                                            style={[
                                                globalStyles.smallPillButton,
                                                { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }
                                            ]}
                                        >
                                            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                        </Pressable>
                                        {editingItem ? (
                                            <Pressable
                                                onPress={onDelete}
                                                style={[
                                                    globalStyles.smallPillButton,
                                                    { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }
                                                ]}
                                            >
                                                <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                            </Pressable>
                                        ) : null}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                )
            }
            {
                mode === 'quickinfo' && (
                    <Modal visible={visible} transparent animationType="fade">
                        <View style={globalStyles.overlay}>
                            <Pressable
                                onPress={onClose}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            />
                            <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                            <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                                <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
                            </Pressable>
                            <View style={globalStyles.overlayContent}>
                                <ScrollView>
                                    <TextInput
                                        placeholder="Title"
                                        placeholderTextColor={Colors[colorScheme].tri}
                                        value={form.title}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                    />
                                    <TextInput
                                        placeholder="Message"
                                        placeholderTextColor={Colors[colorScheme].tri}
                                        value={form.message}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, message: text }))}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                        multiline
                                    />
                                    <Pressable onPress={onSave} style={[globalStyles.smallPillButton, { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }]}>
                                        <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                    </Pressable>
                                    {editingItem && (
                                        <Pressable onPress={onDelete} style={[globalStyles.smallPillButton, { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }]}>
                                            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                        </Pressable>
                                    )}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                )
            }
            {mode === 'searchitems' && (
                <Modal visible={visible} transparent animationType="fade">
                    <View style={globalStyles.overlay}>
                        <Pressable
                            onPress={onClose}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />
                        <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                        <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                            <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
                        </Pressable>
                        <View style={globalStyles.overlayContent}>
                            <ScrollView>
                                {['name', 'description', 'route'].map((field) => (
                                    <TextInput
                                        key={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        placeholderTextColor={Colors[colorScheme].tri}
                                        autoCapitalize={field === 'route' ? 'none' : 'sentences'}
                                        value={form[field]}
                                        onChangeText={(text) => {
                                            setForm(prev => ({ ...prev, [field]: text }));
                                        }}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                    />
                                ))}
                                <ThemedText type="defaultSemiBold">Type</ThemedText>
                                <Pressable
                                    onPress={() => setShowCategoryPicker('type')}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        borderRadius: 6,
                                        padding: 10,
                                        marginBottom: 10,
                                        backgroundColor: '#f9f9f9'
                                    }}
                                >
                                    <Text>{form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : 'Select Type...'}</Text>
                                </Pressable>

                                <Modal
                                    visible={showCategoryPicker === 'type'}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={() => setShowCategoryPicker(null)}
                                >
                                    <Pressable style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000099' }} onPress={() => setShowCategoryPicker(null)}>
                                        <View style={{ borderRadius: 8, backgroundColor: 'white', padding: 10, height: 200, width: '80%', alignSelf: 'center' }}>
                                            <Picker
                                                selectedValue={form.type}
                                                onValueChange={(value) => {
                                                    setForm(prev => ({ ...prev, type: value }));
                                                    setShowCategoryPicker(null);
                                                }}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <Picker.Item label="Select Type..." value="" />
                                                <Picker.Item label="Tab" value="tab" />
                                                <Picker.Item label="Attraction" value="attraction" />
                                                <Picker.Item label="Product" value="product" />
                                            </Picker>
                                        </View>
                                    </Pressable>
                                </Modal>
                                <Pressable
                                    onPress={onSave}
                                    style={[globalStyles.smallPillButton, { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                </Pressable>
                                {editingItem && (
                                    <Pressable
                                        onPress={onDelete}
                                        style={[globalStyles.smallPillButton, { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }]}
                                    >
                                        <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                    </Pressable>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )
            }
            {mode === 'reward' && (
                <Modal visible={visible} transparent animationType="fade">
                    <View style={globalStyles.overlay}>
                        <Pressable
                            onPress={onClose}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />
                        <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                        <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                            <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
                        </Pressable>
                        <View style={globalStyles.overlayContent}>
                            <ScrollView>
                                <TextInput
                                    placeholder="Reward Name"
                                    placeholderTextColor={Colors[colorScheme].tri}
                                    value={form.name}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                                    style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                />
                                <TextInput
                                    placeholder="Cost in Points"
                                    placeholderTextColor={Colors[colorScheme].tri}
                                    value={form.cost || ''}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, cost: text }))}
                                    style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                    keyboardType="numeric"
                                />
                                <ThemedText type="defaultSemiBold" style={{ marginBottom: 5 }}>Reward Type</ThemedText>
                                {[
                                    { label: 'Free Item', value: 'free' },
                                    { label: 'Discount', value: 'discount' }
                                ].map(({ label, value }) => (
                                    <Pressable
                                        key={value}
                                        onPress={() => setForm(prev => ({ ...prev, type: value }))}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {form.type === value ? (
                                            <IconSymbol
                                                name="checkmark"
                                                size={18}
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderWidth: 1,
                                                    textAlign: 'center',
                                                }}
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderWidth: 1,
                                                }}
                                            />
                                        )}
                                        <ThemedText type="default">{label}</ThemedText>
                                    </Pressable>
                                ))}
                                {form.type === 'discount' && (
                                    <TextInput
                                        placeholder="Discount %"
                                        placeholderTextColor={Colors[colorScheme].tri}
                                        value={form.discount?.toString() || ''}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, discount: parseFloat(text) || 0 }))}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                        keyboardType="numeric"
                                    />
                                )}

                                {form.type === 'free' && (
                                    <TextInput
                                        placeholder="Product ID"
                                        placeholderTextColor={Colors[colorScheme].tri}
                                        value={form.productId || ''}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, productId: text }))}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                    />
                                )}
                                <Pressable
                                    onPress={() => {
                                        console.log("Save button pressed in reward form");
                                        if (!form.name || !form.cost || !form.type) {
                                            console.log("Missing required fields", form);
                                            Alert.alert("Error", "Please fill in Reward Name, Cost, and Type.");
                                            return;
                                        }

                                        if (form.type === 'discount' && (!form.discount || isNaN(form.discount))) {
                                            console.log("Invalid discount value", form.discount);
                                            Alert.alert("Error", "Please enter a valid discount percentage.");
                                            return;
                                        }

                                        if (form.type === 'free' && !form.productId) {
                                            console.log("Missing product ID for free item", form.productId);
                                            Alert.alert("Error", "Please enter a Product ID for Free Item reward.");
                                            return;
                                        }

                                        onSave();
                                    }}
                                    style={[globalStyles.smallPillButton, { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                </Pressable>
                                {editingItem && (
                                    <Pressable
                                        onPress={onDelete}
                                        style={[globalStyles.smallPillButton, { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }]}
                                    >
                                        <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                    </Pressable>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
}
