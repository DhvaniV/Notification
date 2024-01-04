import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Button,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

const App = () => {
  const getFcmToken = async () => {
    let fcmToken = await messaging().getToken();
    console.log('fcm token', fcmToken);
  };

  const getFirebaseToken = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      getFcmToken();
    }
  };

  useEffect(() => {
    getFirebaseToken();

    // Check whether an initial notification is available
    // App is in quit state
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });

    //App running in background
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // App is in foreground

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Welcome',
      body: 'Hi you are welcomed to notification world!',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  }
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => onDisplayNotification()}>
        <Text style={{fontSize: 30}}>Click here to get notification</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
