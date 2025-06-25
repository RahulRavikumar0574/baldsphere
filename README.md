# 🧠 BaldSphere - Interactive Brain Activity Visualizer

A cutting-edge web application that visualizes brain activity in real-time using interactive 3D brain models. Users can type any action and see which brain regions are responsible for it, complete with AI-powered chat assistance and comprehensive brain region highlighting.

---

## 🌟 Features

- ✅ **Interactive 3D Brain Model**: Drag, rotate, and zoom through a detailed brain visualization
- ✅ **Real-time Activity Mapping**: Type any action and see brain regions light up instantly
- ✅ **AI Brain Assistant**: Chat with an intelligent assistant about brain functions
- ✅ **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- ✅ **User Authentication**: Secure login/signup with Supabase integration
- ✅ **Chat History**: Save and retrieve your brain exploration sessions
- ✅ **Dynamic Arrows**: Visual indicators pointing to active brain regions
- ✅ **Reset Functionality**: Clear highlights and reset camera position with one click

---

## 🏗️ Project Structure

```
baldsphere/
│
├── src/
│   ├── app/                    ← 📱 Next.js App Router pages
│   │   ├── page.tsx           ← 🏠 Landing/Login page
│   │   ├── home/              ← 🏡 Authenticated home page
│   │   ├── chat/              ← 💬 Brain chat interface
│   │   ├── history/           ← 📚 Chat history page
│   │   ├── how-it-works/      ← ❓ Information page
│   │   ├── contact/           ← 📞 Contact page
│   │   └── api/               ← 🔌 API endpoints
│   │       ├── auth/          ← 🔐 Authentication routes
│   │       └── database/      ← 💾 Database operations
│   │
│   ├── components/            ← 🧩 Reusable React components
│   │   ├── BrainCanvas.tsx    ← 🧠 Main 3D brain renderer
│   │   ├── BrainModel.tsx     ← 🎯 Brain model with region detection
│   │   ├── HomeBrainModel.tsx ← 🏠 Home page brain display
│   │   ├── Navbar.tsx         ← 🧭 Navigation component
│   │   ├── Footer.tsx         ← 📄 Footer component
│   │   └── ParticleDesign.tsx ← ✨ Background particle effects
│   │
│   ├── lib/                   ← 📚 Utility libraries
│   ├── types/                 ← 📝 TypeScript type definitions
│   ├── utils/                 ← 🛠️ Helper functions
│   └── myBrainData.ts         ← 🧠 Brain region mapping data
│
├── public/                    ← 📁 Static assets
│   ├── Brain.glb             ← 🧠 Main interactive brain model
│   ├── HomeBrain.glb         ← 🏠 Lightweight home page brain
│   ├── blue_brain.glb        ← 💙 Alternative brain model
│   └── *.svg                 ← 🎨 Icons and graphics
│
├── prisma/                   ← 🗄️ Database schema
├── database-setup.sql        ← 📊 SQL setup script
├── package.json              ← 📦 Dependencies
├── tailwind.config.cjs       ← 🎨 Styling configuration
└── README.md                 ← 📖 This file
```

---

## ⚙️ Setup Instructions

### 1. 📦 Install Dependencies

```bash
npm install
```

### 2. 🔧 Environment Configuration

Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Mode
DB_MODE=supabase
```

### 3. 🗄️ Database Setup

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com)
2. **Run SQL Setup**: Copy contents of `database-setup.sql` into Supabase SQL Editor
3. **Execute Script**: Click "RUN" to create all necessary tables

---

## 🚀 How to Use

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Deployment

```bash
npm run build
npm start
```

---

## 🧠 Core Components

### 🎯 BrainCanvas.tsx

- **Purpose**: Main 3D brain renderer with Three.js
- **Features**: Camera controls, lighting, brain model loading
- **Exports**: `BrainCanvas` component with reset functionality

### 🧠 BrainModel.tsx

- **Purpose**: Brain model with region detection and highlighting
- **Features**: Arrow placement, region mapping, material handling
- **Data Source**: Uses `myBrainData.ts` for region information

### 💬 Chat Interface (`/chat`)

- **Purpose**: Interactive brain exploration with AI assistant
- **Features**: Real-time brain highlighting, chat history, reset controls
- **Integration**: Connects to database for message storage

### 🏠 Home Page (`/home`)

- **Purpose**: Landing page for authenticated users
- **Features**: Lightweight brain model, feature cards, particle effects
- **Components**: `HomeBrainModel`, `ParticleDesign`

### 🔐 Authentication (`/api/auth/`)

- **login-supabase/route.ts**: User login with bcrypt password verification
- **signup-supabase/route.ts**: User registration with validation
- **Features**: Password strength validation, error handling

---

## 🎨 Styling & Design

### Tailwind CSS Configuration

- **Custom breakpoints**: `xs: 475px` for better mobile support
- **Responsive design**: Mobile-first approach
- **Color scheme**: Yellow accent (`#f0b100`) with gray base
- **Typography**: Clean, modern font stack

### 3D Graphics

- **Three.js**: WebGL-based 3D rendering
- **React Three Fiber**: React integration for Three.js
- **Models**: Optimized GLB files for fast loading
- **Lighting**: Ambient + directional lighting setup

---

## 📊 Database Schema

### Users Table

```sql
users (
  id: UUID PRIMARY KEY,
  name: VARCHAR(255),
  email: VARCHAR(255) UNIQUE,
  password_hash: VARCHAR(255),
  created_at: TIMESTAMP,
  last_login: TIMESTAMP,
  is_active: BOOLEAN
)
```

### Chat Messages Table

```sql
chat_messages (
  id: UUID PRIMARY KEY,
  user_email: VARCHAR(255),
  user_name: VARCHAR(255),
  role: VARCHAR(50),
  content: TEXT,
  brain_regions: TEXT[],
  activity_type: VARCHAR(100),
  created_at: TIMESTAMP
)
```

### User Preferences Table

```sql
user_preferences (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

---

## 🧠 Brain Data Structure

### myBrainData.ts

```typescript
interface BrainDataItem {
  keyword: string;      // Action/activity name
  region: string[];     // Brain regions involved
}

// Example:
{
  keyword: "think",
  region: ["frontal"]
}
```

### Supported Brain Regions

- **Frontal**: Executive functions, decision making, thinking
- **Parietal**: Spatial processing, sensory integration
- **Temporal**: Memory, language, auditory processing
- **Occipital**: Visual processing

---

## 📱 Responsive Features

### Mobile Optimizations

- **Touch controls**: Optimized for mobile interaction
- **Responsive brain model**: Scales appropriately
- **Button sizing**: 48px minimum for accessibility
- **Particle optimization**: Reduced count on mobile

### Desktop Features

- **Full interactivity**: Complete hover and click effects
- **Larger brain model**: Better detail visibility
- **Enhanced controls**: Full zoom and rotation range

---

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login-supabase`: User login
- `POST /api/auth/signup-supabase`: User registration

### Database Operations

- `GET /api/database/chat_messages`: Retrieve chat history
- `POST /api/database/chat_messages`: Save chat messages
- `GET /api/debug/database`: Database connection testing

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect GitHub**: Link your repository to Vercel
2. **Environment Variables**: Add all required env vars
3. **Deploy**: Automatic deployment on git push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
DB_MODE=supabase
```

---

## 📦 Dependencies

### Core Framework

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety

### 3D Graphics

- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for R3F

### Database & Auth

- **Supabase**: Backend as a service
- **bcryptjs**: Password hashing
- **Prisma**: Database ORM

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

### Particles

- **react-tsparticles**: Interactive particle backgrounds
- **tsparticles-slim**: Lightweight particle engine

---

## 🎯 Key Features Explained

### Brain Region Detection

1. **User Input**: User types an action (e.g., "think")
2. **Data Matching**: System searches `myBrainData.ts`
3. **Region Highlighting**: Corresponding brain regions light up
4. **Arrow Display**: Visual arrows point to active regions

### Chat System

1. **Real-time Interaction**: Instant responses to user queries
2. **Database Storage**: All conversations saved to Supabase
3. **History Retrieval**: Users can view past conversations
4. **Brain Integration**: Chat responses trigger brain visualizations

### Reset Functionality

1. **Clear Highlights**: Removes all brain region highlights
2. **Reset Camera**: Returns to original position and zoom
3. **Clean State**: Provides fresh start for exploration

---

## 🧑‍💻 Development Team

**Created by**: Rahul R
**GitHub**: [RahulRavikumar0574](https://github.com/RahulRavikumar0574)
**Project**: BaldSphere - Interactive Brain Visualizer

---

## 🔬 Technical Highlights

### Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Model Optimization**: Compressed GLB files
- **Responsive Images**: Optimized for different screen sizes
- **Code Splitting**: Automatic bundle optimization

### Accessibility Features

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch Targets**: 48px minimum for mobile
- **Color Contrast**: WCAG compliant color schemes

---

## 🛡️ Security Features

### Authentication Security

- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization

### Data Protection

- **Environment Variables**: Sensitive data protection
- **HTTPS Only**: Secure data transmission
- **Session Management**: Secure user sessions

---

## 📈 Future Enhancements

- 🔬 **Advanced Brain Regions**: More detailed anatomical mapping
- 🎮 **Gamification**: Brain training games and challenges
- 📊 **Analytics**: User interaction tracking and insights
- 🌐 **Multi-language**: Support for multiple languages
- 🎨 **Themes**: Customizable visual themes
- 📱 **Mobile App**: Native mobile application

---

## ⚖️ Disclaimer

This application is designed for educational and research purposes. It provides simplified representations of brain functions and should not be used for medical diagnosis or treatment. Always consult qualified healthcare professionals for medical advice.

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
