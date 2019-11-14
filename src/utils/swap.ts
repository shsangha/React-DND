export default (index1: number, index2: number, array: any[]) => {
  const copy = [...array];

  copy[index1] = array[index2];
  copy[index2] = array[index1];
  return copy;
};
