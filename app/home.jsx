// app/home.jsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import CreateLoopModal from './components/CreateLoopModal';

// ⬇️ import your auth service
import { authService } from './services/authService'; // <-- update path if needed

const Home = () => {
  // Will be populated from Firebase auth
  const [username, setUsername] = useState('User');

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const [showCreateLoop, setShowCreateLoop] = useState(false);

  useEffect(() => {
    // ask for location
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setRegion(r => ({
        ...r,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }));
    })();
  }, []);

  // 🔐 Read username from Firebase Auth
  useEffect(() => {
    // set immediately if user already available
    const current = authService.getCurrentUser?.();
    if (current) {
      const name =
        current.displayName ||
        (current.email ? current.email.split('@')[0] : null) ||
        'User';
      setUsername(name);
    }

    // listen for changes
    const unsubscribe = authService.onAuthStateChanged?.(user => {
      if (user) {
        const name =
          user.displayName ||
          (user.email ? user.email.split('@')[0] : null) ||
          'User';
        setUsername(name);
      } else {
        setUsername('User');
      }
    });

    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, []);

  const openCreateLoop = () => setShowCreateLoop(true);
  const closeCreateLoop = () => setShowCreateLoop(false);

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
        <Text style={styles.cardText}>Hi {username},</Text>
      </View>

      <View style={styles.avatar} />

      <TouchableOpacity style={styles.pill} activeOpacity={0.8} onPress={openCreateLoop}>
        <Text style={styles.pillText}>Wanna create loop?</Text>
      </TouchableOpacity>

      <CreateLoopModal 
        visible={showCreateLoop} 
        onClose={closeCreateLoop} 
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  card: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 100,
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardText: { fontSize: 18 },

  avatar: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  pill: {
    position: 'absolute',
    top: 170,
    left: 20,
    right: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pillText: { fontSize: 16, opacity: 0.6 },
});
