import { PLACEHOLDER_ID } from "../constants";

export default (element: HTMLElement, className: string) => {
  const placeHolder = element.cloneNode(true) as HTMLElement;

  const rect = element.getBoundingClientRect();

  requestAnimationFrame(() => {
    placeHolder.style.position = "absolute";
    placeHolder.style.top = `${rect.top}px`;
    placeHolder.style.left = `${rect.left}px`;
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
