import { TweenLite } from "gsap";

export default (
  [x, y]: [number, number],
  element: HTMLElement | null,
  scrollSensitiity: number
) => {
  if (element) {
    if (x !== 0 || y !== 0) {
      TweenLite.to(element, 0.3, {
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
