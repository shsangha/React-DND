import React, { createContext, createRef, Component } from "react";
import {
  Subject,
  race,
  fromEvent,
  forkJoin,
  of,
  merge,
  iif,
  throwError,
  NEVER
} from "rxjs";
import {
  switchMap,
  filter,
  map,
  tap,
  pairwise,
  expand,
  delay,
  takeUntil,
  throttleTime,
  debounceTime
} from "rxjs/operators";
import createPlaceHolder from "./utils/createPlaceHolder";
import getOffsets from "./utils/getOffsets";
import getDraggable from "./utils/getDraggable";
import moveWithDrag from "./utils/moveWithDrag";
import getEventType from "./utils/getEventType";
import sameContainer from "./utils/sameContainer";
import hasValidDraggableProps from "./utils/hasValidDraggableProps";
import createEvent from "./utils/createEvent";
import getTargetAttrs from "./utils/getTargetAttrs";
import { ContainerState } from "./types";

interface ExtendedHTMLElement extends HTMLElement {
  ["data-collection"]: string;
  ["data-index"]: number;
}

interface Props {
  children: (state: any) => React.ReactNode;
}

interface RefObject {
  [key: string]: React.RefObject<HTMLElement>;
}

export const ContainerContext = createContext({} as any);

export default class Container extends Component<Props, ContainerState> {
  public containerRef = createRef<any>();

  public droppabeRefs: { [key: string]: EventTarget } = {};

  public registerDroppable = (name: string, ref: any) => {
    this.droppabeRefs[name] = ref;
  };

  public unregisterDroppable = (name: string) => {
    delete this.droppabeRefs[name];
  };

  public mouse$ = new Subject<React.MouseEvent>();
  public touch$ = new Subject<React.TouchEvent>();

  public state = {
    dragState: {
      currentIndex: null,
      currentCollection: null
    },
    values: {
      name: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      age: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
    }
  };

  public static defaultProps = {
    scrollX: false,
    scrollY: false
  };

  public mouseDown = (e: React.MouseEvent) => {
    this.mouse$.next(e);
  };

  public touchStart = (e: React.TouchEvent) => {
    this.touch$.next(e);
  };

  public createDrag$ = () => {
    return race(this.mouse$, this.touch$).pipe(
      switchMap(downEvent => {
        const current = downEvent.target as ExtendedHTMLElement;
        const placeHolder = createPlaceHolder(current);

        current.style.background = "green";

        const { state } = this;

        let currentPos = getTargetAttrs(current);

        hasValidDraggableProps(currentPos);

        this.setState({
          dragState: currentPos
        });

        return forkJoin({
          offsets: of({ ...getOffsets(downEvent, current) })
        }).pipe(
          tap(() => {
            this.setState({ dragState: currentPos });
          }),
          switchMap(({ offsets }) =>
            merge(
              fromEvent<React.MouseEvent>(window, "mousemove"),
              fromEvent<React.TouchEvent>(
                downEvent.target as HTMLElement,
                "touchmove",
                {
                  passive: false
                }
              ).pipe(
                tap(e => {
                  e.preventDefault();
                })
              )
            ).pipe(
              map(e => {
                e.preventDefault();
                return e;
              }),
              tap(moveEvent => {
                moveWithDrag(getEventType(moveEvent), offsets, placeHolder);
              }),
              pairwise(),
              debounceTime(40),

              switchMap(([prevMove, currentMove]) => {
                const { clientX: prevX, clientY: prevY } = getEventType(
                  prevMove
                )!;
                const { clientX: currentX, clientY: currentY } = getEventType(
                  currentMove
                )!;

                const deltaX = Math.sign(currentX - prevX);
                const deltaY = Math.sign(currentY - prevY);

                return of(
                  getDraggable(document.elementFromPoint(currentX, currentY))
                ).pipe(
                  tap(() => {
                    this.setState({
                      values: {
                        name: [1, 3, 4],
                        age: [1, 2, 4, 5]
                      }
                    });
                  })
                );
              })
            )
          )
        );
      })
    );
  };

  public componentDidMount() {
    const drag$ = this.createDrag$();

    drag$.subscribe(
      x => {
        console.log(x);
      },
      x => {
        console.log(x);
      },
      () => {
        console.log("done");
      }
    );
  }

  public componentWillUnmount() {
    console.log("INMOUTNS");
  }

  public updateState = (
    change: (
      prevState: Readonly<ContainerState>,
      props: Readonly<Props>
    ) => ContainerState | Pick<ContainerState, "dragState" | "values"> | null
  ) => {
    this.setState(change);
  };

  public render() {
    return (
      <ContainerContext.Provider
        value={{
          state: this.state,
          mouseDown: this.mouseDown,
          touchStart: this.touchStart,
          registerDroppable: this.registerDroppable,
          unregisterDroppable: this.unregisterDroppable,
          updateState: this.updateState
        }}
      >
        <div ref={this.containerRef}>{this.props.children(this.state)}</div>
      </ContainerContext.Provider>
    );
  }
}
