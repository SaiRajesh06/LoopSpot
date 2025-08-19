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
  Alert,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShareLink, generateLoopId } from '../utils/linkUtils';

const isIOS = Platform.OS === 'ios';

const CreateLoopModal = ({ visible, onClose }) => {
  const [step, setStep] = useState('create');

  // form fields
  const [loopName, setLoopName] = useState('');
  const [approxStay, setApproxStay] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(Date.now() + 60 * 60 * 1000));

  // Android pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // share step state
  const [loopDataToShare, setLoopDataToShare] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [loopId, setLoopId] = useState('');

  const fmtDate = (d) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const fmtTime = (d) =>
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  // --- Date/Time change handlers ---
  const onChangeStartDate = (_, selectedDate) => {
    if (!selectedDate) return setShowStartDatePicker(false);
    const next = new Date(startDateTime);
    next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setStartDateTime(next);
    if (!isIOS) setShowStartDatePicker(false);
  };
  const onChangeStartTime = (_, selectedTime) => {
    if (!selectedTime) return setShowStartTimePicker(false);
    const next = new Date(startDateTime);
    next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setStartDateTime(next);
    if (!isIOS) setShowStartTimePicker(false);
  };
  const onChangeEndDate = (_, selectedDate) => {
    if (!selectedDate) return setShowEndDatePicker(false);
    const next = new Date(endDateTime);
    next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setEndDateTime(next);
    if (!isIOS) setShowEndDatePicker(false);
  };
  const onChangeEndTime = (_, selectedTime) => {
    if (!selectedTime) return setShowEndTimePicker(false);
    const next = new Date(endDateTime);
    next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setEndDateTime(next);
    if (!isIOS) setShowEndTimePicker(false);
  };

  // --- helpers ---
  const encodePayload = (obj) => encodeURIComponent(JSON.stringify(obj));
  const validateTimes = () => {
    if (endDateTime < startDateTime) {
      Alert.alert('Invalid time range', 'End must be after Start.');
      return false;
    }
    return true;
  };
  const buildLoopData = (id) => ({
    id,
    loopName: loopName.trim(),
    approxStay: approxStay.trim(),
    startDate: fmtDate(startDateTime),
    startTime: fmtTime(startDateTime),
    endDate: fmtDate(endDateTime),
    endTime: fmtTime(endDateTime),
    startDateTime: new Date(startDateTime).toISOString(),
    endDateTime: new Date(endDateTime).toISOString(),
    createdAt: new Date().toISOString(),
  });

  // --- flow actions ---
  const goToShare = async () => {
    if (!loopName.trim()) {
      Alert.alert('Missing name', 'Please enter a loop name');
      return;
    }
    if (!validateTimes()) return;

    const id = generateLoopId();
    const data = buildLoopData(id);

    try {
      await AsyncStorage.setItem(String(id), JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to store locally:', e);
    }

    const base = getShareLink(id);
    const url = `${base}?d=${encodePayload(data)}`;

    setLoopId(id);
    setLoopDataToShare(data);
    setShareLink(url);
    setStep('share');
  };

  const backToEdit = () => setStep('create');

  const closeAll = () => {
    resetForm();
    onClose?.();
    setStep('create');
  };

  const resetForm = () => {
    setLoopName('');
    setApproxStay('');
    setStartDateTime(new Date());
    setEndDateTime(new Date(Date.now() + 60 * 60 * 1000));
    setLoopDataToShare(null);
    setShareLink('');
    setLoopId('');
    setShowStartDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndDatePicker(false);
    setShowEndTimePicker(false);
  };

  const handleCopy = async () => {
    if (!shareLink) return Alert.alert('No link yet', 'Create the link first.');
    await Clipboard.setStringAsync(shareLink);
    Alert.alert('Copied!', 'Link copied to clipboard.');
  };

  const handleShare = async () => {
    if (!shareLink) return Alert.alert('No link yet', 'Create the link first.');
    const message = `Join my loop "${loopDataToShare?.loopName || 'My Loop'}"
Start: ${loopDataToShare?.startDate} ${loopDataToShare?.startTime}
End:   ${loopDataToShare?.endDate} ${loopDataToShare?.endTime}

Open: ${shareLink}`;
    await Share.share({ title: 'Join my loop', message, url: shareLink });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeAll}
    >
      <Pressable
        style={styles.backdrop}
        onPressOut={(e) => {
          // Only close if clicking outside the modal card
          if (e.target === e.currentTarget) closeAll();
        }}
      >
        <SafeAreaView style={styles.modalCenter}>
          <KeyboardAvoidingView
            behavior={isIOS ? 'padding' : 'height'}
            keyboardVerticalOffset={isIOS ? 0 : 20}
            style={styles.modalCenter}
          >
            {/* CREATE STEP */}
            {step === 'create' && (
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Create Loop</Text>

                <TextInput
                  placeholder="Loop Name"
                  value={loopName}
                  onChangeText={setLoopName}
                  style={styles.input}
                  placeholderTextColor="#9aa0a6"
                />

                {/* START TIME */}
                <Text style={styles.label}>Start Time</Text>
                <View style={styles.inlineRow}>
                  <Text style={styles.inlineValue}>{fmtDate(startDateTime)}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.inlineValue}>{fmtTime(startDateTime)}</Text>
                </View>

                {isIOS ? (
                  <>
                    <DateTimePicker
                      mode="date"
                      display="compact"
                      value={startDateTime}
                      onChange={onChangeStartDate}
                      style={styles.picker}
                    />
                    <DateTimePicker
                      mode="time"
                      display="compact"
                      value={startDateTime}
                      onChange={onChangeStartTime}
                      minuteInterval={1}
                      style={styles.picker}
                    />
                  </>
                ) : (
                  <View style={styles.rowButtons}>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      style={[styles.btn, styles.btnGhost]}
                    >
                      <Text>Pick date</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowStartTimePicker(true)}
                      style={[styles.btn, styles.btnGhost]}
                    >
                      <Text>Pick time</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!isIOS && showStartDatePicker && (
                  <DateTimePicker
                    value={startDateTime}
                    mode="date"
                    display="calendar"
                    onChange={onChangeStartDate}
                  />
                )}
                {!isIOS && showStartTimePicker && (
                  <DateTimePicker
                    value={startDateTime}
                    mode="time"
                    display="clock"
                    onChange={onChangeStartTime}
                  />
                )}

                {/* END TIME */}
                <Text style={[styles.label, { marginTop: 14 }]}>End Time</Text>
                <View style={styles.inlineRow}>
                  <Text style={styles.inlineValue}>{fmtDate(endDateTime)}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.inlineValue}>{fmtTime(endDateTime)}</Text>
                </View>

                {isIOS ? (
                  <>
                    <DateTimePicker
                      mode="date"
                      display="compact"
                      value={endDateTime}
                      onChange={onChangeEndDate}
                      style={styles.picker}
                    />
                    <DateTimePicker
                      mode="time"
                      display="compact"
                      value={endDateTime}
                      onChange={onChangeEndTime}
                      minuteInterval={1}
                      style={styles.picker}
                    />
                  </>
                ) : (
                  <View style={styles.rowButtons}>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                      style={[styles.btn, styles.btnGhost]}
                    >
                      <Text>Pick date</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowEndTimePicker(true)}
                      style={[styles.btn, styles.btnGhost]}
                    >
                      <Text>Pick time</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!isIOS && showEndDatePicker && (
                  <DateTimePicker
                    value={endDateTime}
                    mode="date"
                    display="calendar"
                    onChange={onChangeEndDate}
                  />
                )}
                {!isIOS && showEndTimePicker && (
                  <DateTimePicker
                    value={endDateTime}
                    mode="time"
                    display="clock"
                    onChange={onChangeEndTime}
                  />
                )}

                {/* Approx stay */}
                <TextInput
                  placeholder="Approx Stay"
                  value={approxStay}
                  onChangeText={setApproxStay}
                  style={styles.input}
                  placeholderTextColor="#9aa0a6"
                />

                <View style={styles.row}>
                  <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={closeAll}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={goToShare}>
                    <Text style={styles.btnPrimaryText}>Add Friends</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* SHARE STEP */}
            {step === 'share' && loopDataToShare && (
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Share Loop</Text>

                {/* Loop details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Loop Name:</Text>
                    <Text style={styles.detailValue}>{loopDataToShare.loopName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Start:</Text>
                    <Text style={styles.detailValue}>
                      {loopDataToShare.startDate} at {loopDataToShare.startTime}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>End:</Text>
                    <Text style={styles.detailValue}>
                      {loopDataToShare.endDate} at {loopDataToShare.endTime}
                    </Text>
                  </View>
                  {!!loopDataToShare.approxStay && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>{loopDataToShare.approxStay}</Text>
                    </View>
                  )}
                </View>

                {/* Share link */}
                {!!shareLink && (
                  <View style={{ marginBottom: 8 }}>
                    <Text numberOfLines={2} selectable style={{ fontSize: 12, color: '#007AFF' }}>
                      {shareLink}
                    </Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.shareBtn]}
                    onPress={handleShare}
                  >
                    <Text style={styles.shareBtnText}>Share this loop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.copyBtn]}
                    onPress={handleCopy}
                  >
                    <Text style={styles.copyBtnText}>Copy link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.backBtn]}
                    onPress={backToEdit}
                  >
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
};

export default CreateLoopModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCenter: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    color: '#333',
    fontWeight: '600',
  },
  input: {
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f2f3f5',
    paddingHorizontal: 12,
    marginTop: 10,
    fontSize: 14,
  },
  label: {
    marginTop: 12,
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  inlineRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineValue: {
    fontSize: 14,
    color: '#111',
  },
  dot: {
    opacity: 0.4,
  },
  picker: {
    marginTop: 6,
    alignSelf: 'stretch',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
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
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    gap: 10,
  },
  actionBtn: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    backgroundColor: '#eee',
  },
  backBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
  },
  shareBtn: {
    backgroundColor: '#111',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  copyBtn: {
    backgroundColor: '#e9ecef',
  },
  copyBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});