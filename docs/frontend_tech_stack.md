# IVTS Frontend Technology Stack Summary

This document summarizes the core technologies, tools, and libraries utilized in the IVTS web frontend application (`frontend-vue`), based on the `package.json` configuration.

## 1. Core Framework & Architecture
- **Vue.js 2 (`vue`)**: The progressive JavaScript framework used for building the user interface.
- **Vue Router (`vue-router`)**: The official router for Vue.js, enabling single-page application (SPA) navigation.
- **Vuex (`vuex`)**: The state management pattern and library for managing global application state across components.

## 2. UI Template & Components
- **CoreUI Pro (`@coreui/vue`, `@coreui/coreui-pro`)**: A premium Bootstrap-based admin template that provides a comprehensive set of ready-to-use UI components (sidebar, navbar, cards, forms, etc.).
- **Icons (`@coreui/icons`)**: Standardized icon set provided by CoreUI.
- **Specialized Inputs**:
  - `vue-multiselect` & `vue-select`: Advanced dropdown and select components.
  - `v-calendar` & `vue-simple-calendar`: Calendar and date-picking components.
  - `@bachdgvn/vue-otp-input`: A specialized component for 2FA/OTP code entry.
  - `vue-text-mask`: For input masking formatting.
- **Rich Text Editors**: Integration with both `ckeditor5` and `vue-quill-editor`.
- **Loading Indicators**: `spinkit` for visual loading states.

## 3. Data Visualization & Maps
- **Charts**: `@coreui/vue-chartjs` (a wrapper around Chart.js) for rendering dashboards and analytics.
- **Maps**: `leaflet` (open-source interactive maps) and `vue2-google-maps` for displaying locations, tracking history, or CCTV pinpoints.

## 4. Networking & Real-Time Data
- **Axios (`axios`)**: Promise-based HTTP client used to interact with the Node.js backend REST APIs.
- **Socket.io Client (`socket.io-client`)**: Used to establish WebSocket connections for real-time bidirectional communication (e.g., live tracking updates or alerts).
- **HLS.js (`hls.js`)**: A JavaScript library that implements HTTP Live Streaming clients, used to render live CCTV camera streams directly in the browser.

## 5. Security & Authentication
- **Google OAuth2 (`vue-google-oauth2`)**: Client-side library for handling Google sign-in flows.
- **Form Validation**: `vuelidate` for model-based validation of user inputs and forms.

## 6. Utilities & Data Export
- **Moment.js (`moment`)**: Used for parsing, validating, manipulating, and formatting dates and times.
- **Internationalization (`vue-i18n`)**: Used for supporting multiple languages (localization) across the application.
- **Exporting**:
  - `xlsx`: For generating and downloading Excel spreadsheets (e.g., exporting vehicle or user lists).
  - `html2pdf.js`: For converting HTML views into downloadable PDF documents.
- **IndexedDB (`idb`)**: A lightweight wrapper for working with browser IndexedDB, used for robust client-side storage.

## 7. Development & Build Tools
- **Vue CLI (`@vue/cli-service`)**: Provides the standard build setup, Webpack configuration, and local development server.
- **Sass (`sass`)**: CSS preprocessor used for styling and overriding CoreUI themes.
- **Testing**:
  - **Jest (`@vue/cli-plugin-unit-jest`)**: For running unit tests on Vue components.
  - **Nightwatch (`@vue/cli-plugin-e2e-nightwatch`)**: For end-to-end (E2E) testing.
- **Linting**: ESLint (`eslint`, `eslint-plugin-vue`) for code quality and consistency.
