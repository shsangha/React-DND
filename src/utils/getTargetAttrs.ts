const getDraggableAttrs = (target: HTMLElement) => {
  const currentIndex = target.getAttribute("data-index");

  return {
    currentCollection: target.getAttribute("data-collection"),
    currentIndex: currentIndex ? parseInt(currentIndex, 10) : null
  };
};

const getDroppableAttrs = (target: HTMLElement) => {
  return {
    currentCollection: target.getAttribute("data-droppable")
  };
};

export { getDraggableAttrs, getDroppableAttrs };
