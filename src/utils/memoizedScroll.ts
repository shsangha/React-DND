import checkScroll from "./checkScroll";
import { TweenLite } from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
const plugins = [ScrollToPlugin];

const scroll = (
  [x, y]: [number, number],
  element: HTMLElement | null,
  scrollSensitiity: number
) => {
  if (element) {
    if (x !== 0 || y !== 0) {
      TweenLite.to(element, 0.2, {
        scrollTo: {
          x: `+=${x * scrollSensitiity}`,
          y: `+=${y * scrollSensitiity}`
        }
      });
      return true;
    }
  }

  return false;
};

export default (
  droppable: HTMLElement | null,
  container: HTMLElement,
  placeHolder: HTMLElement,
  deltaX: number,
  deltaY: number,
  scrollSensitiity: number
) => {
  let scrollDroppable = true;

  return () => {
    if (scrollDroppable) {
      scrollDroppable = scroll(
        checkScroll(droppable, placeHolder, deltaX, deltaY),
        droppable,
        scrollSensitiity
      );
    }
    return (
      scrollDroppable ||
      scroll(
        checkScroll(container, placeHolder, deltaX, deltaY),
        container,
        scrollSensitiity
      )
    );
  };
};
