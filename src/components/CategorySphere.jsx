// CategorySphere.js
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";

// Utility: Calculate spherical positions
const calculatePositions = (num, radius = 2) => {
  const positions = [];
  for (let i = 0; i < num; i++) {
    const phi = Math.acos(-1 + (2 * i) / num);
    const theta = Math.sqrt(num * Math.PI) * phi;
    positions.push([
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ]);
  }
  return positions;
};

// eslint-disable-next-line react/prop-types
function CategorySphere({ categories, onSelect, onClose }) {
  const groupRef = useRef();
  // eslint-disable-next-line react/prop-types
  const positions = calculatePositions(categories.length);

  // Emanation effect animation (scale from 0 to 1)
  const { scale } = useSpring({
    scale: 1,
    from: { scale: 0 },
    config: { duration: 1200 }, // About 1.2 seconds; adjust as needed
  });

  // Inertia-driven continuous rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  // Handle selection of a category
  const handleSelect = (cat) => {
    if (navigator.vibrate) navigator.vibrate(10); // Haptic feedback
    onSelect(cat);
  };

  return (
    <a.group ref={groupRef} scale={scale}>
      {/* Render background dots */}
      {positions.map((pos, index) => (
        <mesh key={index} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      ))}
      {/* Render category text, replacing some dots */}
      {categories.map((cat, i) => (
        <Text
          key={cat.id}
          position={positions[i]}
          color="#50b675"
          fontSize={0.3}
          onPointerOver={(e) => {
            e.stopPropagation();
            e.object.scale.set(1.2, 1.2, 1.2); // Scale up on hover/tap
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            e.object.scale.set(1, 1, 1);
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(cat);
            onClose(); // Close overlay after selection
          }}
        >
          {cat.name}
        </Text>
      ))}
    </a.group>
  );
}

export default CategorySphere;
