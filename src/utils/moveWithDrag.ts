import { TweenLite } from "gsap";

export default (event: any, offsets: any, target: HTMLElement) => {
  const x = event.clientX - offsets.pageX + window.scrollX;

  const y = event.clientY - offsets.pageY + window.scrollY;

  TweenLite.to(target, 0, {
    x,
    y
  });
};
