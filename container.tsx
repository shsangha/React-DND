import React, { Component } from "react";
import {
  fromEvent,
  Subscription,
  merge,
  of,
  Observable,
  forkJoin,
  EMPTY
} from "rxjs";
import {
  switchMap,
  tap,
  takeUntil,
  map,
  filter,
  pluck,
  finalize,
  pairwise,
  expand,
  delay,
  throttleTime
} from "rxjs/operators";
import { TweenLite } from "gsap";
import styles from "./style.module.scss";

export default class Container extends Component {
  containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  testRef: React.RefObject<HTMLDivElement> = React.createRef();
  eventSubscription?: Subscription;

  componentDidMount() {
    if (this.containerRef && this.containerRef.current) {
      const mouseDown$ = fromEvent(this.containerRef.current, "mousedown");
      const touchDown$ = fromEvent(this.containerRef.current, "touchstart", {
        passive: true
      }).pipe(switchMap((event: any) => this.copyFirstTouchProps(event)));

      const down$ = merge(mouseDown$, touchDown$).pipe(
        switchMap(event =>
          of(this.getDraggableTarget(event.target)).pipe(
            filter((el): el is HTMLElement => !!el),
            switchMap(target => {
              const dataTransfer = new DataTransfer();

              if (this.containerRef.current) {
                return forkJoin({
                  target: of(target),
                  windowOffsets: of({
                    x: window.scrollX,
                    y: window.scrollY
                  }),
                  containerOffsets: of({
                    x: this.containerRef.current.scrollLeft,
                    y: this.containerRef.current.scrollTop
                  }),
                  ghostImage: of(this.createGhostImage(target)),
                  dataTransfer: of(dataTransfer),
                  dragStartEvent: of(event).pipe(
                    map(evt => {
                      evt.dataTransfer = dataTransfer;
                      return evt;
                    }),
                    map(evt => new DragEvent("dragStart", evt)),
                    tap(dragEvt => {
                      target.dispatchEvent(dragEvt);
                    }),
                    map(event => ({
                      target: Object.freeze(event.target),
                      offsetX: event.offsetX,
                      offsetY: event.offsetY
                    }))
                  )
                });
              }
              throw new Error("no container to attach to ");
            })
          )
        )
      );

      const mouseMove$ = fromEvent(window, "mousemove");
      const touchMove$ = fromEvent(window, "touchmove", {
        passive: true
      }).pipe(switchMap((event: any) => this.copyFirstTouchProps(event)));

      const move$ = merge(mouseMove$, touchMove$);

      const mouseUp$ = fromEvent(window, "mouseup") as Observable<MouseEvent>;
      const touchUp$ = fromEvent(window, "touchend", {
        passive: true
      }) as Observable<TouchEvent>;

      const contextMenu = fromEvent(this.containerRef.current, "contextmenu");

      const up$ = merge(mouseUp$, touchUp$, contextMenu);

      this.eventSubscription = down$
        .pipe(
          switchMap(
            ({
              dragStartEvent,
              target,
              windowOffsets,
              containerOffsets,
              ghostImage
            }: any) =>
              move$.pipe(
                tap((evt: any) => {
                  this.moveGhostImage(
                    evt,
                    dragStartEvent,
                    ghostImage,
                    windowOffsets,
                    containerOffsets
                  );
                }),
                throttleTime(100),
                pairwise(),
                switchMap(([first, second]) => {
                  return of([first, second]).pipe(
                    expand(([first, second]) => {
                      //   console.log("fre");
                      return this.scroll(ghostImage, first, second).pipe(
                        delay(10)
                      );
                    })
                  );
                }),
                takeUntil(up$),
                finalize(() => {
                  if (this.containerRef.current) {
                    this.containerRef.current.removeChild(ghostImage);
                  }
                })
              )
          )
        )

        .subscribe({
          next(x) {
            //       console.log(x);
          },
          error(e) {
            console.log(e);
          },
          complete() {
            console.log("complete");
          }
        });
    }
  }

  componentWillUnmount() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  createDragEvent = (event: any, dataTransfer: DataTransfer) => {
    event.dataTransfer = dataTransfer;
    return new DragEvent("dragstart", event);
  };

  copyFirstTouchProps = (event: any) =>
    of(event).pipe(
      pluck("touches", "0"),
      map((fistTouchProperties: any) => {
        for (let i in fistTouchProperties) {
          if (i !== "target") {
            Object.defineProperty(event, i, {
              value: fistTouchProperties[i],
              writable: false
            });
          }
        }

        return event;
      })
    );

  createGhostImage = (target: any) => {
    const ghostImage = target.cloneNode(true) as HTMLElement;

    ghostImage.style.position = "fixed";
    ghostImage.style.pointerEvents = "none";
    ghostImage.style.border = "3px solid black";
    ghostImage.style.margin = "0";
    ghostImage.style.top = target.getBoundingClientRect().top.toString();
    ghostImage.style.left = target.getBoundingClientRect().left.toString();

    if (this.containerRef.current) {
      this.containerRef.current.insertBefore(ghostImage, target);
      return ghostImage;
    }
    throw new Error("no container to attach to ");
  };

  moveGhostImage = (
    evt: any,
    dragEvent: any,
    ghostImage: any,
    windowOffsets: any,
    containerOffsets: any
  ) => {
    if (this.containerRef.current) {
      const x =
        +evt.clientX -
        dragEvent.offsetX -
        (dragEvent.target.offsetLeft - this.containerRef.current.scrollLeft) +
        (containerOffsets.x - this.containerRef.current.scrollLeft);

      const y =
        +evt.clientY -
        dragEvent.offsetY -
        (dragEvent.target.offsetTop - this.containerRef.current.scrollTop) +
        (containerOffsets.y - this.containerRef.current.scrollTop) +
        windowOffsets.y;

      TweenLite.to(ghostImage, 0, {
        //    x,
        y,
        background: "red"
      });
    }
  };

  scroll = (ghostImage: any, first: any, second: any) => {
    let scrolled = false;

    const container = this.containerRef.current;

    if (container) {
      const directionX = Math.sign(second.clientX - first.clientX);
      const directionY = Math.sign(second.clientY - first.clientY);
      const containerRect = container.getBoundingClientRect();
      const ghostImageRect = ghostImage.getBoundingClientRect();

      const Y = this.scrollY(
        ghostImageRect,
        container,
        containerRect,
        directionY
      );

      scrolled = !!Y;
      console.log(scrolled, "scerolle");
      if (!!Y) {
        TweenLite.to(container, 0, {
          scrollTop: container.scrollTop + 10 * directionY
        });
      }
    }
    return scrolled ? of([first, second]) : EMPTY;
  };

  scrollY = (
    ghostImageRect: any,
    container: any,
    containerRect: any,
    directionY: any
  ) =>
    containerRect.top > ghostImageRect.top &&
    container.scrollTop > 0 &&
    directionY < 0
      ? -1
      : containerRect.bottom < ghostImageRect.bottom &&
        container.scrollHeight -
          (container.scrollTop + container.offsetHeight) >
          0 &&
        directionY > 0
      ? 1
      : 0;

  scrollX = (target: any, container: any) => {
    const containerRect = container.getBoundingClientRect();

    return containerRect.left > target.left
      ? -1
      : containerRect.right < target.right
      ? 1
      : 0;
  };

  getDraggableTarget = (element: any): HTMLElement | null => {
    if (element) {
      if (
        element.hasAttribute("react-draggable") &&
        !!JSON.parse(element.attributes["react-draggable"].value)
      ) {
        return element;
      } else if (!element.parentElement) {
        return null;
      }
      return this.getDraggableTarget(element.parentElement);
    }
    return null;
  };

  render() {
    return (
      <div ref={this.containerRef} className={styles.rxcont}>
        <div
          react-draggable="true"
          onDragStart={e => {
            e.preventDefault();

            e.dataTransfer.setData("dragContent", "ssjdfsd");
          }}
          className={styles.other}
        >
          first
        </div>

        <div
          react-draggable="true"
          onDragStart={e => {
            e.preventDefault();

            e.dataTransfer.setData("dragContent", "ssjdfsd");
          }}
          className={styles.other}
        >
          first
        </div>

        <div
          react-draggable="true"
          onDragStart={e => {
            e.preventDefault();

            e.dataTransfer.setData("dragContent", "ssjdfsd");
          }}
          className={styles.other}
        >
          first
        </div>

        <div
          react-draggable="true"
          onDragStart={e => {
            e.preventDefault();

            e.dataTransfer.setData("dragContent", "ssjdfsd");
          }}
          className={styles.other}
        >
          first
        </div>
      </div>
    );
  }
}
