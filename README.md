# Wi-fi Juxta - Proximity-Based Location Chat

 **Connect with people near you. Share instantly. Chat locally.**

---
## Why Wi-fi Juxta?
This can be explained with interesting examples.
- **1.** Suppose I need a mobile charger in the library. But I do not know anybody around me. Going to everyone and asking is time killing and usually not so welcoming from the asked person. With our webpage everyone on the local Wi-fi can chat and also share files with each other without any login required. Just chat, share and leave.

- **2.** Suppose there is a boring lecture going on in the lecture hall. But the students are from different classes. With our webpage one can easily converse messages with everyone in the hall with no prior contacts required, just join and chat. One can also exchange files and photos making the chat a more usable.

-  **3.** Suppose I am at an event with a local Wi-fi, but I want to know where a particular stall is there. Our Webpage is the best solution for it. No need to have any contacts, just open and ask what you want. Of course one can physically go and ask for it.

-  **4. If our webpage is on the internet, then technically one can talk with anybody with in the desired range of distance. No common network required**

##  Core Features

###  Messaging System
- **Proximity-Based Delivery**: Messages only reach users within 3.5km using Haversine formula
- **Real-Time Communication**: Instant delivery via Socket.io WebSocket
- **Message Limit**: 256 characters per message (balanced for UX & performance)
- **Live User Counter**: "Other users in proximity" updates every 7 seconds
- **System Notifications**: Notified when users join ("_Name_ is ready to Juxt")
- **Flexible Sending**: Send text, attachments, or attachments-only (no text required)

###  Location & Maps
- **GPS Tracking**: Real-time location updates every 3-5 seconds
- **Interactive Map Modal**: View all nearby users with profile pictures on Leaflet map
- **Live Markers**: User markers refresh every 7 seconds
- **User Info Popup**: Hover over markers to see name and coordinates
- **Location Consent**: Explicit user control for location sharing
- **Efficient Queries**: BallTree spatial indexing for O(log n) proximity queries

###  Profile Management
- **Custom Profile**:
  - Display name
  - Profile picture (auto-compressed)
  - Location sharing preference
  - Profile persistence across sessions
  
- **Background Customization**:
  - RGB color picker (full color spectrum)
  - Custom background image upload (uncompressed for quality)
  - Real-time preview
  - Anytime editing via Settings button

###  File & Document Sharing
- **Format Support**: Images (JPG, PNG, GIF, WebP), PDFs, Word docs, text files, audio
- **Size Management**:
  - 5MB per-file limit (enforced before upload)
  - Auto image compression (60% JPEG quality)
  - Dimension limiting (max 1024×1024px)
  - Progressive quality reduction if size > 500KB
  
- **Smart Display**:
  - Images: Inline (max 200×200px, hover zoom)
  - Documents: Downloadable links with type icons
  - File preview before sending
  
- **User Experience**:
  - Loading spinner during upload
  - User-friendly file size error messages
  - Remove attachment before sending

### Modern UI/UX
- **Fully Responsive**:
  - Desktop (1024px+): Full layout
  - Tablet (768px): Compact spacing
  - Mobile (480px): Ultra-compact, touch-optimized
  - Landscape: Height-optimized
  
- **Design System**:
  - Glassmorphism with gradient backgrounds
  - Backdrop blur effects
  - Semi-transparent panels
  - Smooth animations throughout
  
- **Mobile Optimization**:
  - 44×44px minimum touch targets
  - Input font-size 16px (prevents iOS zoom)
  - No horizontal overflow
  - Full-width responsive layouts

### Reliability & Performance
- **Error Handling**:
  - Socket.io frame error monitoring
  - localStorage quota fallback
  - Graceful degradation
  - Detailed console logging
  
- **Performance**:
  - Image compression (~80% size reduction)
  - BallTree spatial indexing
  - Location throttling (3-5s updates)
  - Lazy map loading
  
- **Data Persistence**:
  - localStorage for profiles
  - Fallback strategy if quota exceeded
  - Local-only storage (no backend persistence)

---

## Technology Stack

### Backend
- **Framework**: Flask (Python web framework)
- **Real-Time**: Flask-SocketIO (WebSocket support)
- **Language**: Python 3.7+
- **Spatial Indexing**: BallTree for efficient proximity queries
- **Geolocation**: Haversine formula for GPS distance calculation
- **Protocol**: Socket.io 4.0.1+ with WebSocket + long-polling fallback

### Frontend
- **Code**: Vanilla JavaScript 
- **Maps**: Leaflet.js 1.9.4 + OpenStreetMap tiles
- **Images**: Canvas API for compression & resizing
- **Files**: HTML5 File API for file handling
- **Communication**: Socket.io Client 4.0.1+
- **Styling**: Pure CSS3 (1900+ lines, fully responsive)

### Infrastructure
- **Protocol**: WebSocket via Socket.io with long-polling fallback
- **Concurrency**: Supports up to 5,000 concurrent users
- **CORS**: Enabled for cross-origin requests
- **SSL/TLS**: Supported for production (required for geolocation)

---

##System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (or latest mobile browsers)
- **Device**: Any device with geolocation capability (GPS recommended)
- **Network**: Stable internet connection (WiFi or mobile data)
- **Storage**: ~10MB localStorage (varies by browser)
- **Backend**: Python 3.7+ with pip

---
## Security & Privacy

- **No Backend Storage**: Messages stored only in transit, never persisted server-side
- **Location Consent**: Explicit user permission required before sharing location
- **Anonymous IDs**: Socket.io session IDs used instead of user identifiers
- **Local Storage**: All user profile data stored locally on device, never sent to backend
- **No Tracking**: No analytics, no third-party services, no cookies

---

## Credits & Acknowledgments

- **Leaflet.js** - Interactive map visualization
- **Flask-SocketIO** - Real-time WebSocket communication
- **OpenStreetMap** - Free map tiles and data
- **Socket.io** - Cross-browser WebSocket protocol
- **Canvas API** - Image processing and compression
- **Haversine Formula** - GPS distance calculation

---

<div align="center">

**Built with ❤️ for connecting people nearby**

*Juxta - Connect. Share. Chat Locally. Make spontaneous local connections in real-time.*

**Perfect for boring classes, local events, and silent Libraries !**

</div>
