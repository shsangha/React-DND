import { TweenLite } from "gsap";

export default (
  x: number,
  y: number,
  container: HTMLElement,
  sensitivity: number
) => {
  if (container) {
    TweenLite.to(container, 0, {
      scrollTop: container.scrollTop + sensitivity * y,
      scrollLeft: container.scrollLeft + sensitivity * x
    });

    return !(x === 0 && y === 0);
  }
  throw new Error("No container to attach to");
};
