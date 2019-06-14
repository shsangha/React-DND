const copyFirstTouchProps = (event: TouchEvent, dragEvent: DragEvent) => {
  const touches: { [key: string]: any } = event.touches[0];

  for (const i in touches) {
    if (i !== "target") {
      Object.defineProperty(dragEvent, i, {
        value: touches[i],
        writable: false
      });
    }
  }
  return dragEvent;
};

export default (
  originalEvent: TouchEvent | MouseEvent,
  eventType: string,
  dataTransfer: DataTransfer
) => {
  const dragEvent = new DragEvent(eventType, originalEvent);

  Object.defineProperty(dragEvent, "dataTransfer", {
    value: dataTransfer,
    writable: false
  });
  if (originalEvent instanceof TouchEvent && eventType !== "dragend") {
    return copyFirstTouchProps(originalEvent, dragEvent);
  }
  return dragEvent;
};
