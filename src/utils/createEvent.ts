import { MoveDetail, KeyboardDetail } from "../types";

export default (type: string, detail: MoveDetail | KeyboardDetail) =>
  new CustomEvent(type, {
    bubbles: true,
    detail
  });
