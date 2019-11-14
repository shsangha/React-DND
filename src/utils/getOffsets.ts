import getEventType from "./getEventType";

export default (
  e: React.MouseEvent | React.TouchEvent,
  element: HTMLElement
) => {
  const { pageX, pageY } = getEventType(e)!;

  const rect = element.getBoundingClientRect();

  return {
    pageX,
    pageY,
    windowX: window.scrollX,
    windowY: window.scrollY,
    offsetX: pageX - rect.left,
    offsetY: pageY - rect.top
  };
};
