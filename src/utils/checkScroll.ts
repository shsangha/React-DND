export default (
  container: HTMLElement,
  target: HTMLElement,
  deltaX: number,
  deltaY: number
): [number, number] => {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const x =
    containerRect.left > targetRect.left &&
    container.scrollLeft > 0 &&
    deltaX < 0
      ? -1
      : containerRect.left < targetRect.left &&
        container.scrollWidth - (container.scrollLeft + container.offsetWidth) >
          0 &&
        deltaY > 0
      ? 1
      : 0;

  const y =
    containerRect.top > targetRect.top && container.scrollTop > 0 && deltaY < 0
      ? -1
      : containerRect.bottom < targetRect.bottom &&
        container.scrollHeight -
          (container.scrollTop + container.offsetHeight) >
          0 &&
        deltaY > 0
      ? 1
      : 0;

  return [x, y];
};
