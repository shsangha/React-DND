export default (type: string, detail: object = {}) =>
  new CustomEvent(type, {
    bubbles: true,
    detail
  });
