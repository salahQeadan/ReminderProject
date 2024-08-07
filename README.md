# Reminder App

## Overview

The Reminder App is a full-stack web application that allows users to create reminders with specific dates and times. The app sends notifications to users via push notifications and email when their reminders are due. It also supports user authentication, allowing users to register, log in, and manage their reminders.

## Features

- **User Authentication**: Users can register and log in to manage their reminders.
- **Create Reminders**: Users can create reminders with a specific date, time, and priority (Low, Medium, High).
- **Push Notifications**: The app sends push notifications to the user's device when a reminder is due.
- **Email Notifications**: The app sends an email to the user when a reminder is due.
- **High Contrast Mode**: The app includes a high contrast mode for better accessibility.
- **Adjustable Font Size**: Users can adjust the font size to their preference.

## Technologies Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Material-UI (MUI)**: A popular React UI framework for building responsive web apps.
- **Axios**: A promise-based HTTP client for making requests to the backend.
- **Firebase Messaging**: For handling push notifications.

### Backend
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: A web application framework for Node.js.
- **MongoDB**: A NoSQL database for storing user and reminder data.
- **Mongoose**: An ODM library for MongoDB and Node.js.
- **Firebase Admin SDK**: For sending push notifications from the server.
- **Nodemailer**: For sending email notifications.
- **Node-Cron**: For scheduling tasks to check for due reminders and send notifications.


