import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import IElement from '../../IElement';
import { SortableWrapper } from '../SortableItem/SortableWrapper';
import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';

export default function Cell({
  rowId,
  columnId,
  elements,
}: {
  rowId: number;
  columnId: number;
  elements: IElement[];
}) {
  const id = `cell-${columnId}-${rowId}`;

  const { setNodeRef } = useDroppable({ id });

  const elementIds = useMemo(
    () => elements.map((element) => `element-${element.id}`),
    [elements]
  );

  return (
    <SortableContext
      id={id}
      items={elementIds}
      strategy={verticalListSortingStrategy}
    >
      <div className="cell" ref={setNodeRef}>
        {elements.map((element) => (
          <SortableWrapper
            key={`element-${element.id}`}
            id={`element-${element.id}`}
            element={<div>{element.name}</div>}
          />
        ))}
      </div>
    </SortableContext>
  );
}
