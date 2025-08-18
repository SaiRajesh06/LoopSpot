// app/utils/linkUtils.js
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// In Expo Go (appOwnership === 'expo'), Linking.createURL makes exp:// links.
// On web/standalone builds, it still returns a correct deep link.
export const getShareLink = (loopId) => {
  // If you later add a domain, you can switch on Platform.OS === 'web'
  // and build https://<host>/loop/<id>. For now, just always return createURL.
  return Linking.createURL(`/loop/${encodeURIComponent(loopId)}`);
};

export const generateLoopId = () =>
  `loop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
