interface Pos {
  currentIndex?: any;
  currentCollection: any;
}

export default (oldPos: Pos, newPos: Pos) =>
  oldPos.currentCollection === newPos.currentCollection;
