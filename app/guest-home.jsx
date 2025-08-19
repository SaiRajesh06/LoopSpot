// app/guest-home.jsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoopDetailsModal from './components/LoopDetailsModal';

export default function GuestHome() {
  const { loopId, d } = useLocalSearchParams();
  const [region, setRegion] = useState({
    latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.02, longitudeDelta: 0.02,
  });

  const [incomingLoop, setIncomingLoop] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
    })();
  }, []);

  // Resolve loop data and show the popup
  useEffect(() => {
    (async () => {
      if (!loopId && !d) return;
      let loop = null;

      if (loopId) {
        const stored = await AsyncStorage.getItem(String(loopId));
        if (stored) loop = JSON.parse(stored);
      }
      if (!loop && d) {
        try {
          loop = JSON.parse(decodeURIComponent(String(d)));
          if (loop?.id) await AsyncStorage.setItem(String(loop.id), JSON.stringify(loop));
        } catch {}
      }

      if (loop) {
        setIncomingLoop(loop);
        setShowDetails(true);
      }
    })();
  }, [loopId, d]);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        followsUserLocation
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
      />

      <View style={styles.card}>
        <Text style={styles.cardText}>Welcome 👋</Text>
        <Text style={styles.sub}>You’ve joined a loop.</Text>
      </View>

      <LoopDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        loop={incomingLoop}
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
});
