interface Pos {
  currentIndex: any;
  currentCollection: any;
}

export default (posObj: Pos) => {
  if (
    typeof posObj.currentIndex !== "number" ||
    typeof posObj.currentCollection !== "string"
  ) {
    throw new Error("Index and collection are required props");
  }
};
