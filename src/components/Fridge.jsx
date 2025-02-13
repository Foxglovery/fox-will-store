import { useState } from 'react';
import '../styles/fridge.css';

function Fridge() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');

  const addItem = (e) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      const newItem = { id: Date.now(), text: input.trim() };
      setItems([...items, newItem]);
      setInput('');
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="fridge">
      <div className="fridge-content">
        {items.map(item => (
          <div
            key={item.id}
            className="fridge-item"
            onClick={() => removeItem(item.id)}
          >
            {item.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        className="fridge-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addItem}
        placeholder="Type to add an item..."
      />
    </div>
  );
}

export default Fridge;
