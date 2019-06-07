import { DRAGGABLE_ATTR, DROPPABLE_ID } from "../constants";

const getTarget = (attr: string) =>
  function getDraggableTarget(element: any): HTMLElement | null {
    console.log(element);
    if (
      element.hasAttribute(attr) &&
      JSON.parse(element.attributes[attr].value) != null
    ) {
      return element;
    } else if (!element.parentElement) {
      return null;
    }

    return getDraggableTarget(element.parentElement);
  };

export const getDraggable = getTarget(DRAGGABLE_ATTR);
export const getDroppable = getTarget(DROPPABLE_ID);
