export default (
  e: React.TouchEvent | React.MouseEvent | MouseEvent | TouchEvent
): MouseEvent | React.Touch | React.MouseEvent | undefined => {
  if ("touches" in e) {
    return e.touches[0];
  }

  return e;
};
