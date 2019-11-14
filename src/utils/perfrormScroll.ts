import { TweenLite } from "gsap";
import checkScroll from "./checkScroll";

export default (
  deltaX: number,
  deltaY: number,
  container: HTMLElement,
  target: HTMLElement,
  sensitivity: number
) => {
  const [x, y] = checkScroll(container, target, deltaX, deltaY);

  TweenLite.to(container, 0, {
    scrollTop: container.scrollTop + sensitivity * y,
    scrollLeft: container.scrollLeft + sensitivity * x
  });

  return !(x === 0 && y === 0);
};
