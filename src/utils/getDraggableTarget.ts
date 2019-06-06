export default function getDraggableTarget(element: any): HTMLElement | null {
  console.log(element);
  if (
    element.hasAttribute("react-draggable") &&
    !!JSON.parse(element.attributes["react-draggable"].value)
  ) {
    return element;
  } else if (!element.parentElement) {
    return null;
  }

  return getDraggableTarget(element.parentElement);
}
