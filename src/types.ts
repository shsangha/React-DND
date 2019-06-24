// Container

export interface ContainerContext {
  updateDragState: (args: any) => void;
  checkInContainer: (x: number, y: number) => void;
  scroll: (deltaX: number, deltaY: number, target: HTMLElement) => boolean;
}

export interface ContainerChildArgs {
  data: any[];
  move: (target: number) => void;
  cancelMove: () => void;
  swap: (target: number) => void;
  cancelSwap: () => void;
  insert: (data: any) => void;
  remove: (index: number) => void;
  edit: (index: number, fn: (input: any) => any) => void;
  screenReaderAnnounce: (msg: string) => void;
}

export interface ContainerProps {
  scroll: boolean;
  scrollSensitivity: number;
  children: (arg: ContainerChildArgs) => React.ReactNode;
}

export interface ContainerState {
  data: any[];
  origin: { id: number; index: number } | null;
  over: number | null;
  currentPosition: number | null;
  previousPosition: number | null;
  withinContainer: boolean;
}

// Draggable

export interface DraggableProps {
  resize: boolean;
  animationDuration: number;
  onDragStart: () => void;
  onDragEnd?: () => void;
  onDragCancel?: () => void;
  children: () => React.ReactElement;
}

// Droppable

export interface DroppableProps {
  index: number;
  id: number; // translates to drop-id internally
  disabled?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDrop?: () => void;
  children: () => React.ReactNode;
}

export interface DroppableContext {
  id: number;
  index: number;
}
