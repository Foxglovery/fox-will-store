import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import "./App.css";
import InventoryItem from "./components/InventoryItems"; // Import the new component

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
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
        <div className="inner-rect">
          <div className="flex-item-cont" style={{ width: "100%" }}>
            <ul className="item-container">
              {inventory.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  categories={categories}
                  removeItem={removeItem}
                />
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
        <p>+</p>

      </button>
      
      
      

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Item</h2>
            <div className="itemInputCont">
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
            </div>
            
            <div className="modalBtnCont">
              <button className="addItemBtn" onClick={addItem}>Add Item</button>
              <button className="cancelAddBtn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
