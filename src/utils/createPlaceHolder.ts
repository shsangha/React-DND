import { PLACEHOLDER_ID } from "../constants";

export default (element: HTMLElement) => {
  const placeHolder = element.cloneNode(true) as HTMLElement;

  const rect = element.getBoundingClientRect();

  requestAnimationFrame(() => {
    placeHolder.style.position = "absolute";
    placeHolder.style.top = `${rect.top}`;
    placeHolder.style.left = `${rect.left}`;
    placeHolder.style.pointerEvents = "none";
    placeHolder.style.touchAction = "none";
    placeHolder.style.color = "orange";
    placeHolder.style.margin = "0";
    placeHolder.style.display = "inline-block";
    placeHolder.style.background = "red";
    placeHolder.id = PLACEHOLDER_ID;

    document.body.appendChild(placeHolder);
  });

  return placeHolder;
};
