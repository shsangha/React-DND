import React, { Component, cloneElement } from "react";
import { throwError, merge, fromEvent, of, iif, forkJoin } from "rxjs";
import {
  switchMap,
  delay,
  filter,
  tap,
  map,
  throttleTime,
  pairwise,
  expand,
  takeUntil
} from "rxjs/operators";
import { DragContext } from "./context";
import { getDraggable, getDroppable } from "./utils/getTarget";
import createDragEvent from "./utils/createDragEvent";
import checkScroll from "./utils/checkScroll";
import partial from "./utils/partial";
import { SORT } from "./constants";

interface Props {
  index: number;
  resize: boolean;
  scroll: boolean;
  onDragStart: (inital: any, other: any) => void;
  onDragEnd?: () => void;
  onDragCancel?: () => void;
  children: () => React.ReactElement;
}

const noRefErrorMsg = (index: number) => `Ref not attached at index ${index} `;

export default class Draggable extends Component<Props> {
  public DraggableRef: React.RefObject<any> = React.createRef();

  public static contextType = DragContext;

  public static defaultProps = {
    index: 0,
    resize: false,
    scroll: false,
    onDragStart: (inital: any, next: any) => {
      console.log(inital, next);
    }
  };

  public getSnapshotBeforeUpdate(prevProps: any, prevState: any) {
    // this is where we need to capture prev pos
    return null;
  }

  public componentDidUpdate(prevProps: any, prevState: any) {
    // this is where FLIP animation will be performed
  }

  public componentDidMount() {
    this.sort$().subscribe();
  }

  public sort$ = () => {
    const dragRef = this.DraggableRef.current;

    return dragRef
      ? merge(
          fromEvent<TouchEvent>(dragRef, "touchstart", { passive: true }),
          fromEvent<MouseEvent>(dragRef, "mousedown")
        ).pipe(
          delay(150),
          switchMap(downEvent => {
            const dataTransfer = new DataTransfer();

            const { pageX, pageY } =
              downEvent instanceof TouchEvent
                ? downEvent.touches[0]
                : downEvent;

            return forkJoin({
              offsets: of({
                pageX,
                pageY,
                windowX: window.scrollX,
                windowY: window.scrollY
              })
            }).pipe(
              tap(() => {
                this.context.updateDragContext(
                  {
                    origin: this.props.index,
                    current: this.props.index,
                    type: SORT
                  },
                  partial(this.props.onDragStart)(dataTransfer)
                );
              })
            );
          })
        )
      : throwError(noRefErrorMsg(this.props.index));
  };

  public render() {
    return cloneElement(this.props.children(), {
      ref: this.DraggableRef
    });
  }
}
