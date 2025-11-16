# Across The Gap

**A 2D physics-based bridge-building game inspired by *Poly Bridge***

---

### Gameplay

https://github.com/user-attachments/assets/6f8758d7-c0c5-41d5-9cf8-6f2ae4acfbff

> *A brief video showing the editor, the building process, and a successful (or unsuccessful) simulation.*

## ✨ Core Features

* **🌉 Physics-Based Simulation:** Built on the `matter-js` physics engine to accurately simulate forces, stress, and structural integrity.
* **🏗️ Build Tools:** Players aren't just limited to simple links. They can use:
    * **Chain Tool:** Rapidly build a series of connected segments.
    * **Arch Tool:** Create structurally-sound arches with a defined height.
    * **Move & Delete:** Full control to edit and refine the design.
* **🔩 Resource Management:**
    * Build with different **materials** (like Wood, Steel, and Road), each with unique durability, cost, and weight.
    * All construction is constrained by a level-specific **budget**.
* **🎮 Custom Level Editor:** The game includes a level editor (`LevelCreator`) where customs levels can be built.
    * Place, move, resize, and rotate static map elements.
    * Define anchor points for the player to build from.
    * Set the car's properties and the level's goal.
* **🎥 Dynamic 2D Camera:** A gesture-controlled camera (`CameraView`) supporting smooth panning and pinch-to-zoom, with bounds clamped to the level's size.

---

## 🛠️ Tech Stack

* **Core:** `React Native`, `Expo`, `TypeScript`
* **Physics:** `matter-js`
* **Rendering:** `react-native-skia`
* **Gestures & Animations:** `react-native-gesture-handler` & `react-native-reanimated`
* **Styling:** `Nativewind`
* **Audio:** `expo-audio` & `expo-haptics`
* **Data Persistence:** `expo-file-system`

---

## 🚀 How to Run

This project is built using the Expo managed workflow and can be run locally without any native SDK setup (no Xcode or Android Studio required).

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Aquel32/Across-The-Gap
    cd Across-The-Gap
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the project:**
    ```bash
    npx expo start
    ```

4.  **Open on your device:**
    * Scan the QR code printed in the terminal using the **Expo Go** app on your iOS or Android device.
