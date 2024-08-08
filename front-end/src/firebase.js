import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAQP_q1nsK9DYTMq4ETLrT56ts5USXLOnc",
  authDomain: "reminderproject-7ecef.firebaseapp.com",
  projectId: "reminderproject-7ecef",
  storageBucket: "reminderproject-7ecef.appspot.com",
  messagingSenderId: "616946029992",
  appId: "1:616946029992:web:dd07bcf41dda9d534ff99d",
  measurementId: "G-PLHH2XTT7K"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    await Notification.requestPermission();
    const token = await getToken(messaging, {
      vapidKey: 'BLW8zZu6MsrXOF1Zzj00tm1NT-pTLrLF_Fbfv3f9XYxWraKHz-ph4OWwQvGVB1KPyYRyjCO_2Vx8dLx8RwWa9iE'});
        if(token) {
        console.log('FCM Token:', token);
        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  export const onMessageListener = () =>
    new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
