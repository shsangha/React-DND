export default (
  e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent
): MouseEvent | Touch | undefined => {
  if ("nativeEvent" in e) {
    if (e.nativeEvent instanceof TouchEvent) {
      return e.nativeEvent.touches[0] as Touch;
    }

    if (e.nativeEvent instanceof MouseEvent) {
      return e.nativeEvent as MouseEvent;
    }
  } else {
    if (e instanceof TouchEvent) {
      return e.touches[0];
    }
    if (e instanceof MouseEvent) {
      return e;
    }
  }
};
