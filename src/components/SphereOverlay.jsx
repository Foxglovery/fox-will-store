/* eslint-disable react/prop-types */
// SphereOverlay.js

import { Canvas } from "@react-three/fiber";
import CategorySphere from "./CategorySphere";

const SphereOverlay = ({ categories, onSelect, onClose }) => {
  return (
    <div style={styles.overlay}>
      <Canvas>
        <CategorySphere
          categories={categories}
          onSelect={onSelect}
          onClose={onClose}
        />
      </Canvas>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.8)", // darkened background
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export default SphereOverlay;
