export interface ContainerState {
  dragState: {
    currentIndex: number | null;
    currentCollection: string | null;
  };
  values: {
    [key: string]: any[];
  };
}
