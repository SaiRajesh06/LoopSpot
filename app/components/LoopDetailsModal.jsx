// app/components/LoopDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoopDetailsModal({ visible, onClose, loop, onAddLocation }) {
  const [locationNumber, setLocationNumber] = useState('');

  // Clear the field whenever the modal opens
  useEffect(() => {
    if (visible) setLocationNumber('');
  }, [visible]);

  const onEdit = () => {
    onClose?.();
  };

  const handleAddLocation = () => {
    // send the number back to guest-home so it can enter add-mode
    onAddLocation?.(locationNumber);
    onClose?.();
  };

  const addDisabled = locationNumber.trim().length === 0;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Loop Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Add location number"
            value={locationNumber}
            onChangeText={setLocationNumber}
            keyboardType="number-pad"
          />

          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.btnLight]} onPress={onEdit}>
              <Text>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, addDisabled && { opacity: 0.5 }]}
              onPress={handleAddLocation}
              disabled={addDisabled}
            >
              <Text style={{ color: '#fff' }}>Add Location</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={{ opacity: 0.7 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center', padding: 16,
  },
  card: {
    width: '88%', borderRadius: 12, backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  input: {
    height: 40, borderRadius: 6, borderWidth: 1, borderColor: '#e2e2e2',
    paddingHorizontal: 10, marginTop: 8, marginBottom: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: {
    height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 14, minWidth: 120,
  },
  btnLight: { backgroundColor: '#eee' },
  btnPrimary: { backgroundColor: '#007AFF' },
  close: { alignSelf: 'center', marginTop: 12 },
});
