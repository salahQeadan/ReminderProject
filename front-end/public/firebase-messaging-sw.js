/* eslint-disable no-undef */
// Import the Firebase scripts that are needed for messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
firebase.initializeApp({
  apiKey: "AIzaSyAQP_q1nsK9DYTMq4ETLrT56ts5USXLOnc",
  authDomain: "reminderproject-7ecef.firebaseapp.com",
  projectId: "reminderproject-7ecef",
  storageBucket: "reminderproject-7ecef.appspot.com",
  messagingSenderId: "616946029992",
  appId: "1:616946029992:web:dd07bcf41dda9d534ff99d",
});



// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle, notificationOptions);
});
