import { TweenLite } from "gsap";

export default (event: any, offsets: any, target: HTMLElement) => {
  const x = event.clientX - offsets.pageX + offsets.windowX;

  const y = event.clientY - offsets.pageY + offsets.windowY;

  TweenLite.to(target, 0, {
    x,
    y
  });
};
