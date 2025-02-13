// DraggableItem.jsx

import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';

function DraggableItem({ item }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM',
    item: { id: item.id, name: item.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    padding: '8px',
    border: '1px solid #ccc',
    margin: '4px',
  };

  return (
    <div ref={drag} style={style}>
      {item.name}
    </div>
  );
}

DraggableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default DraggableItem;
