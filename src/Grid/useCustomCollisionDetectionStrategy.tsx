import {
  closestCenter,
  closestCorners,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { useCallback, useRef } from 'react';
import IElement from '../IElement';

export default function useCustomCollisionDetectionStrategy(
  elements: IElement[]
) {
  const lastOverId = useRef(null);

  return useCallback(
    (args) => {
      if (
        args.active.id.indexOf('row') > -1 ||
        args.active.id.indexOf('column') > -1
      )
        return closestCorners(args);

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);

      let overId = getFirstCollision(intersections, 'id').toString();

      if (
        overId !== null &&
        overId.indexOf('row') === -1 &&
        overId.indexOf('column') === -1
      ) {
        const [elementType, columnId, rowId] = overId.split('-');
        if (elementType === 'cell') {
          const elementsInCell = elements.filter(
            (element) =>
              element.columnId === Number(columnId) &&
              element.rowId === Number(rowId)
          );

          if (elementsInCell.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => {
                  const [containerType, containerId] = container.id.split('-');
                  return (
                    containerType === 'element' &&
                    elementsInCell.map((e) => e.id.toString()).includes(containerId)
                  );
                }
              ),
            })[0]?.id.toString();
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [elements]
  );
}
