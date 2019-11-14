export default (index1: number, index2: number, array: any[]) => {
  const copy = [...array];

  copy.splice(index1, 1);

  copy.splice(index2, 0, array[index1]);

  return copy;
};
