// app/guest-home.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoopDetailsModal from './components/LoopDetailsModal';

export default function GuestHome() {
  const mapRef = useRef(null);
  const { loopId, d } = useLocalSearchParams();

  const [region, setRegion] = useState({
    latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.02, longitudeDelta: 0.02,
  });

  const [loop, setLoop] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Add-mode (multi-iteration)
  const [isAdding, setIsAdding] = useState(false);
  const [remainingCount, setRemainingCount] = useState(0);
  const [pendingCoord, setPendingCoord] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [stayTime, setStayTime] = useState('');

  // Edit-mode (tap an existing marker)
  const [editTarget, setEditTarget] = useState(null); // {id, latitude, longitude, name, stayTime}
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');

  // Completion banner
  const [onLoopBannerVisible, setOnLoopBannerVisible] = useState(false);
  useEffect(() => {
    let t;
    if (onLoopBannerVisible) {
      t = setTimeout(() => setOnLoopBannerVisible(false), 6000);
    }
    return () => t && clearTimeout(t);
  }, [onLoopBannerVisible]);

  const loopStorageKey = () =>
    String((loop && (loop.id ?? loop.loopId)) ?? loopId ?? '');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
    })();
  }, []);

  // Resolve loop and open details
  useEffect(() => {
    (async () => {
      if (!loopId && !d) return;
      let data = null;

      if (loopId) {
        const stored = await AsyncStorage.getItem(String(loopId));
        if (stored) data = JSON.parse(stored);
      }
      if (!data && d) {
        try {
          data = JSON.parse(decodeURIComponent(String(d)));
          if (data?.id) await AsyncStorage.setItem(String(data.id), JSON.stringify(data));
        } catch {}
      }

      if (data) {
        setLoop(data);
        setShowDetails(true);
      }
    })();
  }, [loopId, d]);

  const persistLoop = async (updated) => {
    setLoop(updated);
    const key = loopStorageKey();
    if (key) await AsyncStorage.setItem(key, JSON.stringify(updated));
  };

  // Start multi-pin flow; user already entered count in the modal (once)
  const startAddMode = (countFromModal) => {
    const n = Number(countFromModal);
    if (!Number.isFinite(n) || n <= 0) return;
    setShowDetails(false);           // do not show number modal again later
    setIsAdding(true);
    setRemainingCount(n);
    setPendingCoord(null);
    setPlaceName('');
    setStayTime('');
    setEditTarget(null);             // cancel any edit
    setOnLoopBannerVisible(false);   // reset banner while adding
  };

  // Long-press to choose next pin position
  const handleLongPress = (e) => {
    if (!isAdding) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPendingCoord({ latitude, longitude });
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  // Confirm add for this iteration
  const handleConfirmAdd = async () => {
    if (!loop || !pendingCoord) return;

    const next = {
      ...loop,
      locations: [
        ...(loop.locations || []),
        {
          id: Date.now(),
          latitude: pendingCoord.latitude,
          longitude: pendingCoord.longitude,
          name: placeName || `Location ${(loop.locations?.length || 0) + 1}`,
          stayTime,
          order: (loop.locations?.length || 0) + 1,
        },
      ],
    };

    await persistLoop(next);

    const left = remainingCount - 1;
    if (left > 0) {
      // continue to next iteration
      setRemainingCount(left);
      setPendingCoord(null);
      setPlaceName('');
      setStayTime('');
    } else {
      // finished: stay on map, DO NOT reopen the number modal
      setIsAdding(false);
      setPendingCoord(null);
      setPlaceName('');
      setStayTime('');
      // show completion feedback banner
      setOnLoopBannerVisible(true);
    }
  };

  // Tap an existing marker to edit
  const handleMarkerPress = (loc) => {
    if (isAdding) return; // avoid conflicts while adding
    setEditTarget(loc);
    setEditName(loc.name || '');
    setEditTime(loc.stayTime || '');
    setOnLoopBannerVisible(false); // hide banner while editing
  };

  const handleSaveEdit = async () => {
    if (!loop || !editTarget) return;
    const updated = {
      ...loop,
      locations: (loop.locations || []).map(l =>
        l.id === editTarget.id ? { ...l, name: editName, stayTime: editTime } : l
      ),
    };
    await persistLoop(updated);
    setEditTarget(null);
    setEditName('');
    setEditTime('');
  };

  const handleClearPins = async () => {
    if (!loop) return;
    const updated = { ...loop, locations: [] };
    await persistLoop(updated);
    setEditTarget(null);
    setPendingCoord(null);
    setOnLoopBannerVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        followsUserLocation
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        onLongPress={handleLongPress}
      >
        {(loop?.locations || []).map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={loc.stayTime ? `Stay: ${loc.stayTime}` : undefined}
            onPress={() => handleMarkerPress(loc)}
          />
        ))}

        {isAdding && pendingCoord && (
          <Marker coordinate={pendingCoord} title="New location" pinColor="red" />
        )}
      </MapView>

      {/* Welcome card (hidden during add/edit or while success banner is visible) */}
      {!isAdding && !editTarget && !onLoopBannerVisible && (
        <View style={styles.card}>
          <Text style={styles.cardText}>Welcome 👋</Text>
          <Text style={styles.sub}>You’ve joined a loop.</Text>
        </View>
      )}

      {/* Add-mode overlays */}
      {isAdding && (
        <>
          <View style={styles.hintBubble}>
            <Text style={styles.hintTitle}>Add pin ({remainingCount} left)</Text>
            <Text style={styles.hintSub}>Long-press the map to choose a spot</Text>
          </View>

          {pendingCoord && (
            <View style={styles.addCard}>
              <Text style={styles.addTitle}>Add Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Location name (e.g. Hall)"
                value={placeName}
                onChangeText={setPlaceName}
              />
              <TextInput
                style={styles.input}
                placeholder="Time to stay (e.g. 30 min)"
                value={stayTime}
                onChangeText={setStayTime}
              />
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleConfirmAdd}>
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Edit pin card (tap a marker) */}
      {editTarget && !isAdding && (
        <View style={styles.editCard}>
          <Text style={styles.addTitle}>Edit Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Location name"
            value={editName}
            onChangeText={setEditName}
          />
          <TextInput
            style={styles.input}
            placeholder="Time to stay"
            value={editTime}
            onChangeText={setEditTime}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[styles.btn, styles.btnLight]} onPress={() => setEditTarget(null)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSaveEdit}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Clear all pins button (floating) */}
      {(loop?.locations?.length || 0) > 0 && !isAdding && !editTarget && (
        <TouchableOpacity style={styles.clearFab} onPress={handleClearPins}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Remove all pins</Text>
        </TouchableOpacity>
      )}

      {/* Completion banner after all pins are added */}
      {onLoopBannerVisible && !isAdding && !editTarget && (
        <View style={styles.successBanner}>
          <Text style={styles.successTitle}>You’re on loop 🎉</Text>
          <Text style={styles.successSub}>
            Your friends can track you as long as you’re at any of these locations.
          </Text>
          <TouchableOpacity style={styles.successDismiss} onPress={() => setOnLoopBannerVisible(false)}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* The details modal; its Add Location triggers multi-pin mode once */}
      <LoopDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        loop={loop}
        onAddLocation={startAddMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  card: {
    position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: '#fff',
    paddingVertical: 20, paddingHorizontal: 16, borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardText: { fontSize: 18, fontWeight: '600' },
  sub: { marginTop: 4, opacity: 0.7 },

  hintBubble: {
    position: 'absolute', top: 70, left: 20, right: 20,
    paddingVertical: 12, paddingHorizontal: 12, backgroundColor: 'white',
    borderRadius: 10, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  hintTitle: { fontWeight: '600' },
  hintSub: { marginTop: 4, opacity: 0.7, textAlign: 'center' },

  addCard: {
    position: 'absolute', top: 130, left: 40, right: 40,
    backgroundColor: 'white', borderRadius: 10, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  editCard: {
    position: 'absolute', top: 130, left: 40, right: 40,
    backgroundColor: 'white', borderRadius: 10, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  addTitle: { fontWeight: '600', textAlign: 'center', marginBottom: 8 },

  input: {
    height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#e1e1e1',
    paddingHorizontal: 10, marginVertical: 6,
  },

  btn: { height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, flex: 1 },
  btnLight: { backgroundColor: '#eee' },
  btnPrimary: { backgroundColor: '#007AFF' },
  btnText: { color: '#fff', fontWeight: '600' },

  clearFab: {
    position: 'absolute', right: 20, bottom: 30,
    backgroundColor: '#FF3B30', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },

  successBanner: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  successTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4, textAlign: 'center' },
  successSub: { color: 'rgba(255,255,255,0.95)', textAlign: 'center' },
  successDismiss: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
