const draggable = "data-draggable";
const droppable = "data-droppable";

function getDraggable(element: any): HTMLElement | null {
  if (element && element.hasAttribute(draggable)) {
    return element;
  } else if (!element || !element.parentElement) {
    return null;
  }

  return getDraggable(element.parentElement);
}

function getDroppable(element: any): HTMLElement | null {
  if (element && element.hasAttribute(droppable)) {
    return element;
  } else if (!element || !element.parentElement) {
    return null;
  }

  return getDroppable(element.parentElement);
}

export { getDraggable, getDroppable };
