import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import "./App.css";
import InventoryItem from "./components/InventoryItems"; // Your inventory item component

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

  // Show/hide add-item modal form
  const [showForm, setShowForm] = useState(false);

  // State for deletion confirmation modal
  const [itemToDelete, setItemToDelete] = useState(null);

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
      // Find the selected category from the categories array.
      const selectedCategory = categories.find((cat) => cat.id === category);
      // Use the averageShelfLife if available, otherwise default to 7 days.
      const shelfLife =
        selectedCategory && selectedCategory.averageShelfLife
          ? selectedCategory.averageShelfLife
          : 7;
      // If expirationDate is not provided, calculate one by adding shelfLife days to today.
      const expDate = expirationDate
        ? new Date(expirationDate)
        : new Date(new Date().setDate(new Date().getDate() + shelfLife));
        
      const newItem = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dateAdded: new Date().toISOString(),
        expirationDate: expDate.toISOString(),
        category,
      };
      push(inventoryRef, newItem);
      setName("");
      setExpirationDate("");
      setCategory("");
      setShowForm(false);
    }
  };

  // deleteItem actually removes the item from Firebase.
  const deleteItem = (itemId) => {
    const itemRef = ref(database, `inventory/${itemId}`);
    remove(itemRef);
  };

  // confirmDelete looks up the full item from inventory by id and sets it in state,
  // triggering the confirmation modal.
  const confirmDelete = (itemId) => {
    const item = inventory.find((itm) => itm.id === itemId);
    if (item) {
      setItemToDelete(item);
    }
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
                  removeItem={confirmDelete}
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
                id="itemNameTextInput"
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
              <span>or</span>
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
              
              <button id="addItemBtn" onClick={addItem}>
                Add Item
              </button>
              <button
                id="cancelAddBtn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              Are you sure you want to delete {itemToDelete.name}?
            </p>
            <div className="modalBtnCont">
              <button
                className="deleteConfirmBtn"
                onClick={() => {
                  deleteItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
              >
                Delete
              </button>
              <button
                className="cancelDeleteBtn"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
