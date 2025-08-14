// app/CreateLoopModal.jsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';

const CreateLoopModal = ({ visible, onClose }) => {
  const [loopName, setLoopName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [approxStay, setApproxStay] = useState('');

  const onAddFriends = () => {
    // TODO: Add your logic here
    // Example: validate fields, make API calls, etc.
    // if (!loopName) return; // simple guard
    
    console.log('Loop Details:', {
      loopName,
      startTime,
      endTime,
      approxStay
    });
    
    // Reset form and close modal
    setLoopName('');
    setStartTime('');
    setEndTime('');
    setApproxStay('');
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setLoopName('');
    setStartTime('');
    setEndTime('');
    setApproxStay('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose} // Android back button
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        {/* prevent backdrop press from closing when tapping inside the card */}
        <Pressable>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalCenter}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Loop</Text>

              <TextInput
                placeholder="Loop Name"
                value={loopName}
                onChangeText={setLoopName}
                style={styles.input}
                placeholderTextColor="#9aa0a6"
              />
              <TextInput
                placeholder="Start Time"
                value={startTime}
                onChangeText={setStartTime}
                style={styles.input}
                placeholderTextColor="#9aa0a6"
              />
              <TextInput
                placeholder="End Time"
                value={endTime}
                onChangeText={setEndTime}
                style={styles.input}
                placeholderTextColor="#9aa0a6"
              />
              <TextInput
                placeholder="Approx Stay"
                value={approxStay}
                onChangeText={setApproxStay}
                style={styles.input}
                placeholderTextColor="#9aa0a6"
              />

              <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={handleClose}>
                  <Text>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onAddFriends}>
                  <Text style={styles.btnPrimaryText}>Add Friends</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CreateLoopModal;

const styles = StyleSheet.create({
  // Modal styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCenter: { width: '100%' },
  modalCard: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalTitle: {
    alignSelf: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f2f3f5',
    paddingHorizontal: 12,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: '#eee',
  },
  btnPrimary: {
    backgroundColor: '#111',
  },
  btnPrimaryText: {
    color: '#fff',
  },
});