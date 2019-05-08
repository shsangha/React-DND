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
import styles from "./style.module.scss";
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
  take,
  throttleTime
} from "rxjs/operators";
import { TweenLite } from "gsap";
import { cpus } from "os";

export default class Container extends Component {
  containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  testRef: React.RefObject<HTMLDivElement> = React.createRef();
  eventSubscription?: Subscription;
  containerSrollOffset = {
    x: 0,
    y: 0
  };

  windowScrollOffset = {
    x: 0,
    y: 0
  };

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
                this.containerSrollOffset.y = this.containerRef.current.scrollTop;
                this.containerSrollOffset.x = this.containerRef.current.scrollLeft;
                this.windowScrollOffset.y = window.scrollY;
              }

              return forkJoin({
                target: of(target),
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
            ({ dragStartEvent, target, targetOffsets, ghostImage }: any) =>
              move$.pipe(
                tap((evt: any) => {
                  this.moveGhostImage(
                    evt,
                    dragStartEvent,
                    ghostImage,
                    targetOffsets
                  );
                }),
                throttleTime(100),
                pairwise(),
                switchMap(([first, second]) => {
                  return of([first, second]).pipe(
                    expand(([first, second]) => {
                      return this.scroll(target, first, second).pipe(
                        delay(100)
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
    initialOffsets: any
  ) => {
    if (this.containerRef.current) {
      // console.log(dragEvent, "offset?");

      const x =
        +evt.clientX -
        dragEvent.offsetX -
        (dragEvent.target.offsetLeft - this.containerRef.current.scrollLeft) +
        (this.containerSrollOffset.x - this.containerRef.current.scrollLeft); //+
      //       window.scrollX;

      const y =
        +evt.clientY -
        dragEvent.offsetY -
        (dragEvent.target.offsetTop - this.containerRef.current.scrollTop) +
        (this.containerSrollOffset.y - this.containerRef.current.scrollTop) +
        this.windowScrollOffset.y;

      //  console.log(a, b, c, d);
      //  console.log(y);

      TweenLite.to(ghostImage, 0, {
        //    x,
        y,
        background: "red"
      });
    }
  };

  setInitialOffsets = (event: any) => {
    console.log(event, "EVENT");
    return event;
  };

  scroll = (target: any, first: any, second: any) => {
    let scrolled = false;

    console.log(first.clientY, second.clientY);

    if (this.containerRef.current) {
      const directionX = Math.sign(second.clientX - first.clientX);
      const directionY = Math.sign(second.clientY - first.clientY);

      scrolled = true;
    }
    return scrolled ? of([first, second]) : EMPTY;
  };

  scrollUp = (target: any) => {
    const container = this.containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      if (containerRect.top > target.top && container.scrollTop > 0) {
        TweenLite.to(this.containerRef.current, 0, {
          scrollTop: container.scrollTop - 7
        });
        return true;
      }
    }
    return false;
  };

  scrollDown = (target: any, first: any, second: any) => {
    const container = this.containerRef.current;

    if (container) {
      const containerRect = container.getBoundingClientRect();

      if (containerRect.bottom < target.bottom) {
        TweenLite.to(this.containerRef.current, 0, {
          scrollTop: container.scrollTop + 7
        });
      }
    }
  };

  scrollLeft = (target: any) => {
    const container = this.containerRef.current;

    if (container) {
      const containerRect = container.getBoundingClientRect();

      if (containerRect.left > target.left) {
        TweenLite.to(this.containerRef.current, 0, {
          scrollLeft: container.scrollLeft - 7
        });
      }
    }
  };

  scrollRight = (target: any) => {
    const container = this.containerRef.current;

    if (container) {
      const containerRect = container.getBoundingClientRect();

      if (containerRect.right < target.right) {
        TweenLite.to(this.containerRef.current, 0, {
          scrollLeft: container.scrollLeft - 7
        });
      }
    }
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
