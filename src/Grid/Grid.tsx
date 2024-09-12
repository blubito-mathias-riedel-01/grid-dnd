import { useState } from 'react';
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import './Grid.css';
import { SortableWrapper } from './SortableItem/SortableWrapper';
import { createPortal } from 'react-dom';
import { arrayMove } from '@dnd-kit/sortable';

const Grid = () => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [rows, setRows] = useState([
    { id: 1, name: 'Row 1', position: 1 },
    { id: 2, name: 'Row 2', position: 2 },
    { id: 3, name: 'Row 3', position: 3 },
  ]);

  const [columns, setColumns] = useState([
    { id: 1, name: 'Column 1', position: 1 },
    { id: 2, name: 'Column 2', position: 2 },
    { id: 3, name: 'Column 3', position: 3 },
  ]);

  const [elements] = useState([
    { id: 1, name: 'Item 1', column: 1, row: 1, position: 1 },
  ]);

  const [activeElement, setActiveElement] = useState(null);
  const [isColumnSortingActive, setIsColumnSortingActive] = useState(false);

  const handleDragStart = ({ active }) => {
    const [elementType, id] = active.id.split('-');

    if (elementType === 'column')
      setActiveElement(columns.find((column) => column.id.toString() === id));

    if (elementType === 'row')
      setActiveElement(rows.find((row) => row.id.toString() === id));
  };

  const handleDragOver = ({ over }) => {
    console.log(over.id);
  };

  const handleDragEnd = ({ active, over }) => {
    const [activeElementType, activeId] = active.id.split('-');
    const [overElementType, overId] = over.id.split('-');

    if (activeElementType === 'column' && overElementType === 'column') {
      const activeIndex = columns.findIndex(
        (column) => column.id.toString() === activeId
      );
      const overIndex = columns.findIndex(
        (column) => column.id.toString() === overId
      );

      setColumns(arrayMove(columns, activeIndex, overIndex));
    }

    if (activeElementType === 'row' && overElementType === 'row') {
      const activeIndex = rows.findIndex(
        (row) => row.id.toString() === activeId
      );
      const overIndex = rows.findIndex(
        (row) => row.id.toString() === overId
      );

      setRows(arrayMove(rows, activeIndex, overIndex));
    }

    setActiveElement(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        id="grid"
        items={columns}
        strategy={
          isColumnSortingActive
            ? horizontalListSortingStrategy
            : verticalListSortingStrategy
        }
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: '1fr '.repeat(columns.length + 1) }}
        >
          <div></div>
          {columns.map((column) => (
            <SortableWrapper
              key={`column-${column.id}`}
              id={`column-${column.id}`}
              element={
                <div
                  className="cell columnHandle"
                  onMouseEnter={() => setIsColumnSortingActive(true)}
                  onMouseLeave={() => setIsColumnSortingActive(false)}
                >
                  {column.name}
                </div>
              }
            />
          ))}
          {rows.map((row) => (
            <>
              <SortableWrapper
                key={`row-${row.id}`}
                id={`row-${row.id}`}
                element={
                  <div className="cell rowHandle">
                    {row.name}
                  </div>
                }
              />
              {columns.map((column) => (
                <div className="cell" key={`element-${column.id}-${row.id}`}>
                  {
                    elements.find(
                      (element) =>
                        element.row === row.id && element.column === column.id
                    )?.name
                  }
                </div>
              ))}
            </>
          ))}
        </div>
      </SortableContext>
      {createPortal(
        <DragOverlay className="dragOverlay">
          {activeElement ? (
            <div className="cell">{activeElement.name}</div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default Grid;
