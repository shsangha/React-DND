export default (
  container: HTMLElement | null,
  target: HTMLElement,
  deltaX: number,
  deltaY: number
): [number, number] => {
  let x = 0;
  let y = 0;

  if (container) {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const computedStyle = window.getComputedStyle(container);
    const xBehavior = computedStyle.getPropertyValue("overflow-x");
    const yBehavior = computedStyle.getPropertyValue("overflow-y");

    const scrollsX = xBehavior === "auto" || xBehavior === "scroll";
    const scrollsY = yBehavior === "auto" || yBehavior === "scroll";

    if (scrollsX) {
      if (containerRect.left > targetRect.left && deltaX <= 0) {
        if (container.scrollLeft > 0) {
          x = -1;
        }
      }
      if (containerRect.right < targetRect.right) {
        if (
          Math.ceil(container.scrollWidth - container.scrollLeft) !==
            container.clientWidth &&
          deltaX >= 0
        ) {
          x = 1;
        }
      }
    }

    if (scrollsY) {
      if (containerRect.top > targetRect.top) {
        if (container.scrollTop > 0) {
          y = -1;
        }
      }

      if (containerRect.bottom < targetRect.bottom) {
        if (
          Math.ceil(container.scrollHeight - container.scrollTop) !==
            container.clientHeight &&
          deltaY >= 0
        ) {
          y = 1;
        }
      }
    }
  }

  return [x, y];
};
