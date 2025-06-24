🌿 Litchfield Explorer

⸻

🚀 App Running Command
Frontend
1️⃣ Clone the repository
git clone https://github.com/YourUsername/litchfieldexplorer.git
cd litchfieldexplorer
2️⃣ Install dependencies
npm install
3️⃣ Start the Expo development server
npx expo start
4️⃣ Run on your device or emulator
	•	Scan the QR code in Expo Dev Tools using the Expo Go app (Android/iOS).
	•	Or press:
	•	i to run on an iOS simulator

5️⃣ (Optional) Clear cache if needed
npx expo start -c

Backend
1️⃣ Put the serviceAccountKey.json in /backend
2️⃣ Build the Docker image
cd backend
docker build -t server .
3️⃣ Run the Docker container
docker run -p 3000:3000 server

⸻

📍 Description

Litchfield Explorer is a mobile app designed to help tourists and locals discover and navigate Litchfield National Park and nearby attractions. It offers easy access to information about waterfalls, trails, swimming spots, and local shops, all while supporting the local community. With offline access and in-app admin tools, the app ensures visitors have reliable information, even in remote areas.

⸻

🧭 Approach

The app is developed with a mobile-first, user-friendly approach using modern technologies. Key principles include:
	•	A clean, themed user interface with light/dark modes.
	•	Secure user authentication and session management.
	•	Offline capability to handle poor connectivity common in remote parks.
	•	An in-app admin dashboard for easy content management by authorized users.
	•	Organized, modular code for maintainability and scalability.

⸻

⚙️ Tech Stack
	•	Framework: React Native (with Expo)
	•	Backend: Firebase Authentication & Firestore
	•	Routing: expo-router for navigation
	•	Offline Support: Local caching for attractions and shop data
	•	Admin Dashboard: Built into the app for managing attractions and shops
	•	Theming: Custom global styles and dynamic light/dark themes
	•	State Management: React hooks and Context API

⸻

✨ Key Features (Implemented)

✅ User Authentication:
	•	Email/password sign-up and secure login
	•	Password recovery option

✅ Explore & Discover:
	•	Browse detailed attractions and local shops with images and descriptions
	•	Search functionality for easy discovery

✅ Local Shops & Vendors:
	•	Information on local businesses and their products
	•	Users can place orders directly within the app

✅ Offline Mode:
	•	Cached attraction and shop data for use without internet

✅ In-App Admin Dashboard:
	•	Manage attractions and shop listings directly from the app
	•	Add, update, or remove content easily

✅ Responsive Theming:
	•	Supports light and dark mode for comfortable viewing

✅ Smooth Feedback:
	•	Loading indicators and clear error messages for a seamless experience

✅ Point and Rewards System:
    • Earn points for activities and redeem rewards

⸻

🚀 Future Expectations
	•	Attraction & Product Reviews: Allow users to submit and read ratings and feedback
	•	Interactive Map: Show attractions and shops on a map with navigation support
	•	Saved Favourites: Let users bookmark places and plan trips
	•	Push Notifications: Keep users informed about events, alerts, or promotions
	•	Verified Badges: Build trust by verifying user actions and reviews

⸻

🎯 Goal

To provide an all-in-one, reliable guide for exploring Litchfield National Park, enriching visitor experiences and boosting support for local businesses and communities.
