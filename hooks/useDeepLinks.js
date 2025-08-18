// hooks/useDeepLinks.js
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { handleIncomingLink } from '../app/utils/linkUtils';

export const useDeepLinks = () => {
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
      const linkData = handleIncomingLink(url);
      
      if (linkData) {
        switch (linkData.type) {
          case 'loop_invitation':
            router.push(`/loop/${linkData.loopId}`);
            break;
          default:
            console.log('Unknown link type:', linkData.type);
        }
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

export default useDeepLinks;