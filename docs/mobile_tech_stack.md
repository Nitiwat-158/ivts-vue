# IVTS Mobile Application Technology Stack Summary

This document summarizes the core technologies, tools, and libraries utilized in the IVTS mobile application (`user-mobile-application`), based on the Flutter `pubspec.yaml` configuration.

## 1. Core Framework
- **Flutter (`flutter`)**: Google's UI toolkit for building natively compiled applications for mobile, web, and desktop from a single Dart codebase. This app currently targets mobile and Windows desktop testing.
- **Material Design**: Uses `uses-material-design: true` and `cupertino_icons` to provide native-feeling components for both Android and iOS paradigms.

## 2. State Management & Architecture
- **Provider (`provider`)**: A wrapper around InheritedWidget to make state management reusable, easier, and scalable. Used to inject and manage application state (e.g., authentication state, active emergencies, and API repositories) throughout the widget tree.

## 3. Maps & Geolocation
- **Flutter Map (`flutter_map`)**: A versatile mapping package for Flutter, compatible with Leaflet maps. Used to render OpenStreetMap (OSM) or other tile-based maps.
- **LatLong2 (`latlong2`)**: A lightweight library for calculating geographic coordinates and distances, used in conjunction with `flutter_map` for vehicle tracking and emergency pinpoints.

## 4. Networking & APIs
- **HTTP Client (`http`)**: The standard composable Dart library for making HTTP requests to the backend Node.js mobile API (`/api/v1/mobile`).

## 5. Security & Authentication
- **Secure Storage (`flutter_secure_storage`)**: Provides a secure way to store key-value pairs (like JWT access tokens) using Keychain on iOS and EncryptedSharedPreferences on Android.
- **Web Auth 2 (`flutter_web_auth_2`)**: Used for authenticating users via web-based flows (like the MFU IAM proxy login).
- **Google Sign-In (`google_sign_in`)**: Official plugin for integrating Google OAuth authentication directly within the mobile app.

## 6. Device Integration
- **Image Picker (`image_picker`)**: A plugin for selecting images from the device's image library or taking new pictures with the camera. Likely used for capturing vehicle registration documents or uploading photos during emergency reports.

## 7. Utilities
- **UUID (`uuid`)**: Used to generate unique identifiers, often necessary for local tracking of state or generating client-side IDs before syncing with the backend.

## 8. Development & Testing
- **Flutter Test (`flutter_test`)**: The standard testing library for writing unit and widget tests in Flutter.
- **Flutter Lints (`flutter_lints`)**: A set of recommended lints (rules) to encourage good coding practices and maintain code quality in Dart.
