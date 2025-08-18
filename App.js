// App.js
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

// Hook for handling deep links
const useDeepLinks = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle app launch from deep link
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          handleDeepLink(initialURL);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Handle deep links when app is already running
    const handleDeepLink = (url) => {
      console.log('Deep link received:', url);
      
      try {
        const { path } = Linking.parse(url);
        
        // Handle loop invitation links
        if (path && path.startsWith('loop/')) {
          const loopId = path.split('/')[1];
          if (loopId) {
            console.log('Navigating to loop:', loopId);
            router.push(`/loop/${loopId}`);
          }
        }
      } catch (error) {
        console.error('Error parsing deep link:', error);
      }
    };

    // Set up listeners
    handleInitialURL();
    
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, [router]);
};

export default function App() {
  // Initialize deep link handling
  useDeepLinks();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen 
          name="loop/[loopId]" 
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Loop Invitation',
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: '#f8f9fa',
            },
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}