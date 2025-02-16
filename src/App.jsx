import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import "./App.css";
import freshIcon from "./assets/fresh.png"
import expiredIcon from "./assets/dead-fish-white.png"
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
  // Form fields
  const [name, setName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [category, setCategory] = useState("");

  // Inventory and categories
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);

  // Show/hide modal form
  const [showForm, setShowForm] = useState(false);

  // Refs for scaling inventory list inside the fridge inner area
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const [scale, setScale] = useState(1);

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

  // Recalculate scale so that the inventory list fits inside the inner fridge area
  useEffect(() => {
    if (containerRef.current && listRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const listHeight = listRef.current.offsetHeight;
      if (listHeight > containerHeight) {
        setScale(containerHeight / listHeight);
      } else {
        setScale(1);
      }
    }
  }, [inventory]);

  const addItem = () => {
    if (name.trim() !== "" && category !== "") {
      const inventoryRef = ref(database, "inventory");
      const newItem = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dateAdded: new Date().toISOString(),
        expirationDate: expirationDate
          ? new Date(expirationDate).toISOString()
          : null,
        category,
      };
      push(inventoryRef, newItem);
      setName("");
      setExpirationDate("");
      setCategory("");
      setShowForm(false);
    }
  };

  const removeItem = (itemId) => {
    const itemRef = ref(database, `inventory/${itemId}`);
    remove(itemRef);
  };

  return (
    <div id="main-container">
      <div className="fridge-container">
        {/* The inner-rect element confines the inventory list to the fridge interior */}
        <div className="inner-rect" ref={containerRef}>
        <div className="flex-item-cont" style={{ width: "100%" }}>
  <ul className="item-container" ref={listRef}>
    {inventory.map((item) => (
      <li key={item.id} onClick={() => removeItem(item.id)}>
        <div className="item-name">
          <strong>{item.name}</strong>
        </div>
        <div>
        </div>
        <div className="date-container">
          <div className="item-added">
        <img
    src={freshIcon}
    alt="Favicon"
    style={{ width: "16px", height: "16px", marginRight: "4px", verticalAlign: "middle" }}
  />
          {new Date(item.dateAdded).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit"
          })}
          </div>
        {item.expirationDate && (
          <div className="item-expiration">
            <img
    src={expiredIcon}
    alt="Favicon"
    style={{ width: "16px", height: "16px", marginRight: "4px", verticalAlign: "middle" }}
    />
            {new Date(item.expirationDate).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit"
          })}
          </div>
        )}
        </div>
        
      </li>
    ))}
  </ul>
</div>
        </div>
      </div>

      <button
        id="open-form-button"
        onClick={() => setShowForm(true)}
        title="Add New Item"
      >
        ＋
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Item</h2>
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
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
