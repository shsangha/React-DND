export interface ContainerState {
  dragState: {
    currentIndex: number | null;
    currentCollection: string | null;
    moveType: null | "keyboard" | "pointer";
  };
  values: {
    [key: string]: any[];
  };
}

export interface ContainerProps {
  children: (state: {
    insertDraggable: (name: string, value: any, index?: number) => void;
    insertDroppable: (name: string, initialValues: any[]) => void;
    removeDraggable: (name: string, index: number) => void;
    removeDroppable: (name: string) => void;
    screenReaderAnnounce: (msg: string) => void;
    updateState: (
      change: (
        prevState: Readonly<ContainerState>,
        props: Readonly<ContainerProps>
      ) => ContainerState | Pick<ContainerState, "dragState" | "values"> | null,
      cb?: () => void
    ) => void;
    state: ContainerState;
  }) => React.ReactElement;
  placeholderClass: string;
  scrollSensitvity: number;
  initialState: {
    [key: string]: any[];
  };
}

export interface ContainerContext {
  state: ContainerState;
  mouseDown: (e: React.MouseEvent) => void;
  touchStart: (e: React.TouchEvent) => void;
  keyStart: (e: React.KeyboardEvent) => void;
  registerDroppable: (name: string, ref: HTMLElement) => void;
  unregisterDroppable: (name: string) => void;
  screenReaderAnnounce: (msg: string) => void;
  updateState: (
    change: (
      prevState: Readonly<ContainerState>,
      props: Readonly<ContainerProps>
    ) => ContainerState | Pick<ContainerState, "dragState" | "values"> | null,
    cb?: () => void
  ) => void;
}

export interface MoveDetail {
  type: "move";
  placeholderRect: ClientRect | DOMRect;
  position: { currentCollection: string; currentIndex: number | null };
  offsets: {
    pageX: number;
    pageY: number;
    windowX: number;
    windowY: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface KeyboardDetail {
  type: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";
  callback?: () => void;
  container: HTMLElement;
}

export interface CustomDragEvent extends React.DragEvent {
  detail?: MoveDetail | KeyboardDetail;
}

export interface ElementWDataAttrs extends HTMLElement {
  ["data-collection"]: string;
  ["data-index"]: number;
}

export interface DroppableProps {
  name: string;
  children: (args: {
    atCapacity: boolean;
    dragging: boolean;
    removeCurrentDroppable: () => void;
    removeDraggableAtIndex: (index: number) => void;
    insertInDraggable: (value: any, index?: number) => void;
  }) => React.ReactElement;
  behavior: "swap" | "sort" | "shift" | "append";
  cap?: number;
  resize: boolean;
}

export interface DroppableContext {
  collection: string;
}

export interface DraggableProps {
  index: number;
  children: (args: {
    dragging: boolean;
    removeOnClick: () => void;
  }) => React.ReactElement;
}

export interface CombinedDraggableProps extends DraggableProps {
  collection: string;
}
