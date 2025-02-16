import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import "./App.css";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY, // Replace with your API key
  authDomain: "fox-will-store.firebaseapp.com",
  databaseURL: "https://fox-will-store-default-rtdb.firebaseio.com",
  projectId: "fox-will-store",
  storageBucket: "fox-will-store.firebasestorage.app",
  messagingSenderId: "335967716565",
  appId: "1:335967716565:web:b0be9a25b55ffe91384e5c",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  // Form states for new item input
  const [name, setName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [category, setCategory] = useState("");
  // State for inventory items and categories
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);

  // Listen for inventory updates
  useEffect(() => {
    const inventoryRef = ref(database, "inventory");
    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const inventoryArray = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setInventory(inventoryArray);
      } else {
        setInventory([]);
      }
    });
  }, []);

  // Listen for category updates
  useEffect(() => {
    const categoriesRef = ref(database, "categories");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesArray = Object.entries(data).map(([id, cat]) => ({
          id,
          ...cat,
        }));
        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    });
  }, []);

  // Function to add an inventory item
  const addItem = () => {
    if (name.trim() !== "" && category !== "") {
      const inventoryRef = ref(database, "inventory");
      const newItem = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dateAdded: new Date().toISOString(),
        expirationDate: expirationDate
          ? new Date(expirationDate).toISOString()
          : null,
        category, // this should match one of the keys in the categories node
      };
      push(inventoryRef, newItem);
      setName("");
      setExpirationDate("");
      setCategory("");
    }
  };

  // Optional: function to remove an item (triggered on click)
  const removeItem = (itemId) => {
    const itemRef = ref(database, `inventory/${itemId}`);
    remove(itemRef);
  };

  return (
    <div id="main-container">
      <header>Fridge Inventory</header>
      <div id="fridge-container">
        <div id="fridge-content">
          <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="date"
            placeholder="Expiration date (optional)"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button onClick={addItem}>Add Item</button>
          <ul id="shopping-list">
            {inventory.map((item) => (
              <li key={item.id} onClick={() => removeItem(item.id)}>
                <strong>{item.name}</strong>
                <br />
                Added: {new Date(item.dateAdded).toLocaleString()}
                <br />
                {item.expirationDate && (
                  <>
                    Expires:{" "}
                    {new Date(item.expirationDate).toLocaleDateString()}
                    <br />
                  </>
                )}
                Category: {item.category}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
