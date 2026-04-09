# 🌡️ SmartHome Temperature Monitoring System

A full-stack IoT dashboard for monitoring and visualizing temperature data collected from an Arduino device. The system stores sensor data in a database and presents it through a modern web interface with filtering, statistics, and history tracking.

---

## 🚀 Features

### 📊 Dashboard
- Interactive temperature chart
- Time filtering (1D, 1W, 1M, 1Y)
- Real-time statistics:
  - Minimum temperature
  - Maximum temperature
  - Average temperature

### 📜 History
- Table view of recorded temperature data
- Sorted by latest entries
- Easy overview of past measurements

### 🎛️ Control
- Set temperature threshold (warning/limit)
- Configure data transmission interval (e.g. every 60 seconds)

### ❓ Help
- Explains how the system works
- Describes filters, chart, and statistics

### ⚙️ Settings
- Placeholder for future user-based settings (authentication required)

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Recharts (data visualization)

### Backend / Database
- Supabase (PostgreSQL + REST API)

### Hardware
- Arduino (with WiFi module)

---

## ⚙️ How It Works

1. The Arduino collects temperature data  
2. Data is sent to Supabase via HTTPS  
3. The Next.js application fetches the data from the database  
4. The data is:
   - Visualized in charts  
   - Filtered by time  
   - Summarized with statistics  
5. Users can interact with the dashboard and view historical data  

---

## 🔐 Security

- All communication between components is handled over **HTTPS**
- This ensures:
  - Data encryption during transmission  
  - Protection against man-in-the-middle attacks  
