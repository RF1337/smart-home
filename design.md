# Design System

## 🎯 Goal

Create an intuitive and minimal dashboard focused on clarity, usability, and real-time data visualization.

---

## 🧠 Design Principles

* The interface must be intuitive and easy to understand without explanation
* Use simple and limited colors to avoid cognitive overload
* Maintain strong contrast between background and content for readability
* Follow Gestalt principles to create a clear visual hierarchy and grouping

---

## 👁️ Gestalt Principles (applied)

* **Proximity**: Related elements are grouped closely together
* **Similarity**: Consistent colors and styles for similar elements
* **Hierarchy**: Important elements stand out using size and weight
* **Figure/Ground**: Clear separation between content and background

---

## 🎨 Colors

Keep colors simple and consistent.

Primary:

* Blue: #2563eb

Background:

* Light: #f4f4f5 (zinc-50)
* Dark: #000000

Text:

* Light mode: #000000
* Dark mode: #fafafa

Error:

* Red: #dc2626

Rules:

* Use 1 primary color
* Avoid unnecessary accent colors
* Ensure high contrast (WCAG-friendly)

---

## 🔤 Typography (Major Third Scale)

Use a **Major Third (1.250) scaling system** for consistent typography.

Example scale:

* text-xs: 12px
* text-sm: 14px
* text-base: 16px
* text-lg: 20px
* text-xl: 25px
* text-2xl: 31px

Rules:

* Titles use larger scale steps
* Body text remains readable and consistent
* Avoid random font sizes

---

## 🧱 Layout

* Centered layout
* Max width: 768px (max-w-3xl)
* Padding: 32px (p-8)
* Use spacing to separate sections clearly
* Rounded corners and subtle shadows

---

## 📊 Data Visualization

* Use line charts for time-based data
* Smooth lines (monotone)
* No unnecessary decorations
* Show maximum ~100 data points
* Always include:

  * X-axis (time)
  * Y-axis (value)
  * Tooltip

---

## ⚡ Behavior

* Show loading state before data is ready
* Show clear error messages if something fails
* Realtime updates:

  * Add newest data
  * Remove oldest data

---

## 🔐 Authentication UX

* Redirect unauthenticated users to /login
* Keep login simple (email + password)
* No unnecessary steps

---

## 🚫 Avoid

* Overcomplicated UI
* Too many colors
* Poor contrast
* Random spacing or typography
* Distracting animations

---

## 💡 Prompt Usage (AI)

"Create an intuitive dashboard with simple colors, strong contrast, and a clear layout. Follow Gestalt principles and use a Major Third typography scale. Focus on clarity and usability over decoration."
