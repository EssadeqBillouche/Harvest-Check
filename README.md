# 🌾 Harvest Check

> A comprehensive mobile application for agricultural parcel management, crop tracking, and harvest recording — built for farmers who want a simple, reliable tool to manage their fields.

[![React Native](https://img.shields.io/badge/React_Native-0.81-blue?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-54-black?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

---

## 📱 Screenshots

| Login | Dashboard | Parcels | Profile |
|:-----:|:---------:|:-------:|:-------:|
| *Auth screen* | *Overview stats* | *Parcel list* | *Farmer profile* |

---

## ✨ Features

### Authentication
- Email/password registration & login via **Firebase Auth**
- Persistent sessions with secure token storage
- Single "Agriculteur" profile type

### Parcel Management
- Create, edit, and archive agricultural parcels
- Track surface area (hectares) and location
- Status management: **Active** · **Fallow** · **Archived**

### Zone System
- Subdivide parcels into multiple zones
- Independent surface tracking per zone
- Zone-level crop assignment

### Culture Tracking
- 6 crop categories: Cereals, Vegetables, Fruits, Legumes, Oilseeds, Other
- Lifecycle statuses: **Planned** → **Growing** → **Harvested** / **Failed**
- Planting & expected harvest dates

### Harvest Recording
- Log weight (kg), harvest date, and quality rating
- Quality grades: Excellent · Good · Average · Poor
- Notes field for observations
- Historical harvest data per culture

### Dashboard
- Total parcels, active cultures, and harvest weight at a glance
- Recent harvests feed
- Quick-action buttons for common tasks

---

## 🏗️ Architecture

```
Harvest-check/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/             # Login & Register screens
│   ├── (tabs)/             # Tab navigator (Dashboard, Parcels, Harvests, Profile)
│   ├── parcel/             # Parcel CRUD screens
│   ├── zone/               # Zone create & detail
│   ├── culture/            # Culture create & detail
│   └── harvest/            # Harvest recording
├── components/
│   └── ui/                 # Reusable UI components (Button, Input, Card, Badge, etc.)
├── config/
│   └── firebase.ts         # Firebase initialization
├── constants/
│   └── theme.ts            # Colors, Spacing, Radius, Shadows (light/dark)
├── contexts/
│   └── auth.context.tsx    # Authentication provider & hook
├── hooks/                  # Custom React hooks
│   ├── use-parcels.ts      # Parcel state management
│   ├── use-zones.ts        # Zone state management
│   ├── use-cultures.ts     # Culture state management
│   └── use-harvests.ts     # Harvest state management
├── services/               # Firestore CRUD operations
│   ├── auth.service.ts
│   ├── parcel.service.ts
│   ├── zone.service.ts
│   ├── culture.service.ts
│   └── harvest.service.ts
├── types/
│   └── index.ts            # TypeScript interfaces & types
└── utils/
    ├── date.ts             # Date formatting utilities (fr-FR locale)
    └── validation.ts       # Generic form validation engine
```

### Design Patterns

| Pattern | Usage |
|---------|-------|
| **Services → Hooks → Screens** | Clean separation of Firestore logic, state management, and UI |
| **Context API** | Auth state shared globally via `AuthProvider` |
| **File-based routing** | Expo Router v6 with typed routes |
| **Custom validation** | Schema-based form validation without external libraries |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **Language** | TypeScript 5.9 (strict mode) |
| **Navigation** | Expo Router v6 (file-based) |
| **Backend** | Firebase Auth + Cloud Firestore |
| **State** | React Context + Custom Hooks |
| **UI** | Custom component library with light/dark theme |
| **Storage** | AsyncStorage (session persistence) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo CLI** (`npx expo`)
- A **Firebase project** with Auth & Firestore enabled
- **Expo Go** app (iOS/Android) or an emulator

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Harvest-Check.git
cd Harvest-Check/Harvest-check
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env` file at the project root (or edit `config/firebase.ts` directly) with your Firebase credentials:

```env
EXPO_PUBLIC_API_KEY=your_api_key
EXPO_PUBLIC_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_PROJECT_ID=your_project_id
EXPO_PUBLIC_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_APP_ID=your_app_id
```

> **Firestore Rules:** Make sure your Firestore security rules allow authenticated reads/writes to the `farmers`, `parcels`, `zones`, `cultures`, and `harvests` collections.

### 4. Start the app

```bash
npx expo start
```

Then scan the QR code with **Expo Go** or press:
- `a` → Android emulator
- `i` → iOS simulator
- `w` → Web browser

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Launch on Android emulator |
| `npm run ios` | Launch on iOS simulator |
| `npm run web` | Launch in web browser |
| `npm run lint` | Run ESLint |

---

## 🗃️ Data Model

```
Farmer (Agriculteur)
 └── Parcel (Parcelle)          — surface, location, status
      ├── Zone                  — subdivision of a parcel
      │    └── Culture          — crop type, planting/harvest dates, status
      │         └── Harvest     — weight, date, quality, notes
      └── Culture (direct)      — can also be assigned at parcel level
           └── Harvest
```

### Key Types

```typescript
Farmer    { id, uid, email, displayName, phone, address }
Parcel    { id, farmerId, name, surface, location, status }
Zone      { id, parcelId, name, surface }
Culture   { id, parcelId, zoneId, name, type, plantingDate, expectedHarvestDate, status }
Harvest   { id, parcelId, zoneId, cultureId, date, weight, quality, notes }
```

---

## 🎨 Theme

The app uses a custom **agricultural green** color palette with full light/dark mode support:

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#2D7A3A` | `#4CAF50` |
| Background | `#F5F7F5` | `#1A1C1A` |
| Surface | `#FFFFFF` | `#2C2E2C` |
| Danger | `#D32F2F` | `#EF5350` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with 💚 for farmers everywhere
</p>
