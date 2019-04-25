import React, { Component } from "react";
import { fromEvent, Subscription, merge, of, Observable } from "rxjs";
import styles from "./style.module.scss";
import {
  switchMap,
  tap,
  takeUntil,
  map,
  filter,
  pluck,
  finalize
} from "rxjs/operators";
import { TweenLite } from "gsap";

export default class Container extends Component {
  containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  testRef: React.RefObject<HTMLDivElement> = React.createRef();
  eventSubscription?: Subscription;
  containerSrollOffset = {
    x: 0,
    y: 0
  };
  windowScrollOffset = {
    x: window.scrollX,
    y: window.scrollY
  };

  componentDidMount() {
    if (this.containerRef && this.containerRef.current) {
      const mouseDown$ = fromEvent(this.containerRef.current, "mousedown");
      const touchDown$ = fromEvent(this.containerRef.current, "touchstart", {
        passive: true
      }).pipe(
        switchMap((event: any) =>
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
          )
        )
      );
      const down$ = merge(mouseDown$, touchDown$).pipe(
        map(event => {
          const target = this.getDraggableTarget(event.target);
          if (target && this.containerRef.current) {
            this.containerSrollOffset.y = this.containerRef.current.scrollTop;
            this.containerSrollOffset.x = this.containerRef.current.scrollLeft;
            /* 
            this.windowScrollOffset = {
              x: window.scrollX,
              y: window.screenY
            };
            */
            const dataTransfer = new DataTransfer();
            event.dataTransfer = dataTransfer;
            const dragEvent = new DragEvent("dragstart", event);

            target.dispatchEvent(dragEvent);

            const ghostImage = target.cloneNode(true) as HTMLElement;

            ghostImage.style.position = "fixed";
            ghostImage.style.pointerEvents = "none";
            ghostImage.style.border = "3px solid black";
            ghostImage.style.margin = "0";
            ghostImage.style.top = target
              .getBoundingClientRect()
              .top.toString();
            ghostImage.style.left = target
              .getBoundingClientRect()
              .left.toString();

            this.containerRef.current.insertBefore(ghostImage, target);

            return {
              target,
              ghostImage,
              dataTransfer,
              dragEvent: {
                offsetX: dragEvent.offsetX,
                target: Object.freeze(dragEvent.target),
                offsetY: dragEvent.offsetY
              }
            };
          }

          return null;
        }),
        filter(x => !!x)
      );

      const mouseMove$ = fromEvent(window, "mousemove");

      const touchMove$ = fromEvent(window, "touchmove", {
        passive: true
      }).pipe(
        switchMap((event: any) =>
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
          )
        )
      );
      const move$ = merge(mouseMove$, touchMove$);

      const mouseUp$ = fromEvent(window, "mouseup") as Observable<MouseEvent>;
      const touchUp$ = fromEvent(window, "touchend", {
        passive: true
      }) as Observable<TouchEvent>;

      const contextMenu = fromEvent(this.containerRef.current, "contextmenu");

      const up$ = merge(mouseUp$, touchUp$, contextMenu);

      this.eventSubscription = down$
        .pipe(
          switchMap(({ target, ghostImage, dataTransfer, dragEvent }: any) =>
            move$.pipe(
              tap((evt: any) => {
                this.moveGhostImage(evt, dragEvent, ghostImage);
              }),
              tap((evt: any) => {}),
              tap((evt: any) => {
                const ghostRect = ghostImage.getBoundingClientRect();
                //    console.log(ghostRect);
                //            this.scrollUp(ghostRect);
                //            this.scrollDown(ghostRect);
                //            this.scrollLeft(ghostRect);
                //            this.scrollRight(ghostRect);
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
            // console.log(x);
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

  moveGhostImage = (evt: any, dragEvent: any, ghostImage: any) => {
    if (this.containerRef.current) {
      const x =
        +evt.clientX -
        dragEvent.offsetX -
        (dragEvent.target.offsetLeft - this.containerRef.current.scrollLeft) +
        (this.containerSrollOffset.x - this.containerRef.current.scrollLeft); //+
      //       window.scrollX;

      const a = evt.clientY; //not the issue
      const b = dragEvent.offsetY;
      const c =
        dragEvent.target.offsetTop - this.containerRef.current.scrollTop;
      const d =
        this.containerSrollOffset.y - this.containerRef.current.scrollTop;

      const y =
        +evt.clientY -
        dragEvent.offsetY -
        (dragEvent.target.offsetTop - this.containerRef.current.scrollTop) +
        (this.containerSrollOffset.y - this.containerRef.current.scrollTop);
      /*
        +
        window.scrollY;
*/
      console.log(a, b, c, d);
      console.log(y);

      TweenLite.to(ghostImage, 0, {
        //    x,
        y,
        background: "red"
      });
      this.windowScrollOffset = {
        x: window.scrollX,
        y: window.scrollY
      };
    }
  };

  scrollUp = (target: any) => {
    const container = this.containerRef.current;

    if (container) {
      const containerRect = container.getBoundingClientRect();

      if (containerRect.top > target.top && container.scrollTop > 0) {
        TweenLite.to(this.containerRef.current, 0, {
          scrollTop: container.scrollTop - 7
        });
      }
    }
  };

  scrollDown = (target: any) => {
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
