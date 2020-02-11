import { PLACEHOLDER_ID } from "../constants";

export default (
  element: HTMLElement,
  className: string,
  offsets: {
    pageX: number;
    pageY: number;
    windowX: number;
    windowY: number;
    offsetX: number;
    offsetY: number;
  }
) => {
  const placeHolder = element.cloneNode(true) as HTMLElement;

  const rect = element.getBoundingClientRect();

  requestAnimationFrame(() => {
    placeHolder.style.position = "absolute";
    placeHolder.style.top = `${offsets.pageY -
      offsets.offsetY +
      offsets.windowY}px`;
    placeHolder.style.left = `${offsets.pageX -
      offsets.offsetX +
      offsets.windowX}px`;
    placeHolder.style.pointerEvents = "none";
    placeHolder.style.touchAction = "none";
    placeHolder.style.color = "orange";
    placeHolder.style.margin = "0";
    placeHolder.style.width = `${rect.width}px`;
    placeHolder.style.height = `${rect.height}px`;
    placeHolder.style.display = "inline-block";
    placeHolder.id = PLACEHOLDER_ID;
    placeHolder.setAttribute("data-cy", "placeholder");
    if (className) {
      placeHolder.classList.add(className);
    }

    document.body.appendChild(placeHolder);
  });

  return placeHolder;
};
