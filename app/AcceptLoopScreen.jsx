// app/AcceptLoopScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const AcceptLoopScreen = () => {
  const router = useRouter();
  const { loopId } = useLocalSearchParams();
  const [loopData, setLoopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loopId) {
      loadLoopData(loopId);
    }
  }, [loopId]);

  const loadLoopData = async (id) => {
    try {
      setLoading(true);
      // Replace this with your actual data fetching logic
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const storedData = await AsyncStorage.getItem(`loop_${id}`);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setLoopData(parsedData);
      } else {
        // If not found locally, try fetching from your backend
        await fetchLoopFromServer(id);
      }
    } catch (err) {
      console.error('Error loading loop data:', err);
      setError('Failed to load loop data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoopFromServer = async (id) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`https://yourapi.com/api/loops/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLoopData(data);
      } else {
        throw new Error('Loop not found');
      }
    } catch (err) {
      setError('Loop not found or expired');
    }
  };

  const handleAcceptLoop = async () => {
    try {
      // Add the current user to the loop
      // This is where you'd implement your join loop logic
      Alert.alert(
        'Success!',
        'You have joined the loop successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the loop details or main screen
              router.replace('/'); // or wherever you want to navigate
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to join the loop');
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Loop',
      'Are you sure you want to reject this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading loop...</Text>
        </View>
      </View>
    );
  }

  if (error || !loopData) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {error || 'Loop not found'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Accept Loop</Text>
        <Text style={styles.subtitle}>You've been invited to join:</Text>

        <View style={styles.loopCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loop Name:</Text>
            <Text style={styles.detailValue}>{loopData.loopName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Time:</Text>
            <Text style={styles.detailValue}>
              {loopData.startDate} at {loopData.startTime}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Time:</Text>
            <Text style={styles.detailValue}>
              {loopData.endDate} at {loopData.endTime}
            </Text>
          </View>
          
          {loopData.approxStay && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{loopData.approxStay}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(loopData.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptLoop}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AcceptLoopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  loopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rejectButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});