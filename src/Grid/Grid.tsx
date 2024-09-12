import { useState } from 'react';
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
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
import Cell from './Cell/Cell';
import IElement from '../IElement';
import useCustomCollisionDetectionStrategy from './useCustomCollisionDetectionStrategy';

const Grid = () => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [rows, setRows] = useState([
    { id: 1, name: 'Row 1' },
    { id: 2, name: 'Row 2' },
    { id: 3, name: 'Row 3' },
  ]);

  const [columns, setColumns] = useState([
    { id: 1, name: 'Column 1' },
    { id: 2, name: 'Column 2' },
    { id: 3, name: 'Column 3' },
  ]);

  const [elements, setElements] = useState<IElement[]>([
    { id: 1, name: 'Item 1', columnId: 1, rowId: 1 },
    { id: 2, name: 'Item 2', columnId: 1, rowId: 1 },
  ]);

  const [activeElement, setActiveElement] = useState(null);
  const [isColumnSortingActive, setIsColumnSortingActive] = useState(false);

  const customCollisionDetectionStrategy = useCustomCollisionDetectionStrategy(elements);

  const handleDragStart = ({ active }) => {
    const [elementType, id] = active.id.split('-');

    if (elementType === 'column')
      setActiveElement(columns.find((column) => column.id.toString() === id));

    if (elementType === 'row')
      setActiveElement(rows.find((row) => row.id.toString() === id));

    if (elementType === 'element')
      setActiveElement(
        elements.find((element) => element.id.toString() === id)
      );
  };

  const updateRowAndColumnId = (
    id: number,
    columnId: number,
    rowId: number
  ) => {
    const updatedElements = elements.map((element) => {
      if (element.id === id) {
        return {
          ...element,
          rowId: Number(rowId),
          columnId: Number(columnId),
        };
      }
      return element;
    });

    setElements(updatedElements);
  };

  const handleDragOver = ({ active, over }) => {
    const [activeElementType, activeId] = active.id.split('-');
    const [overElementType, columnId, rowId] = over.id.split('-');
    const overId = columnId;

    if (activeElementType === 'element' && overElementType === 'cell') {
      updateRowAndColumnId(Number(activeId), Number(columnId), Number(rowId));
    }

    if (activeElementType === 'element' && overElementType === 'element') {
      const activeElement = elements.find(
        (elements) => elements.id.toString() === activeId
      );
      const overElement = elements.find(
        (elements) => elements.id.toString() === overId
      );
      const didRowOrColumnChange =
        activeElement.rowId !== overElement.rowId ||
        activeElement.columnId !== overElement.columnId;

      if (didRowOrColumnChange) {
        updateRowAndColumnId(
          Number(activeId),
          overElement.columnId,
          overElement.rowId
        );
      }
    }
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
      const overIndex = rows.findIndex((row) => row.id.toString() === overId);

      setRows(arrayMove(rows, activeIndex, overIndex));
    }

    if (activeElementType === 'element' && overElementType === 'element') {
      const activeIndex = elements.findIndex(
        (element) => element.id.toString() === activeId
      );
      const overIndex = elements.findIndex(
        (elements) => elements.id.toString() === overId
      );

      setElements(arrayMove(elements, activeIndex, overIndex));
    }

    setActiveElement(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        id="grid"
        items={isColumnSortingActive ? columns : rows}
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
                element={<div>{row.name}</div>}
              />
              {columns.map((column) => (
                <Cell
                  columnId={column.id}
                  rowId={row.id}
                  elements={elements.filter(
                    (element) =>
                      element.rowId === row.id && element.columnId === column.id
                  )}
                />
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
