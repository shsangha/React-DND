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
  finalize,
  pairwise,
  startWith,
  bufferCount
} from "rxjs/operators";
import { TweenLite } from "gsap";

export default class Container extends Component {
  containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  testRef: React.RefObject<HTMLDivElement> = React.createRef();
  eventSubscription?: Subscription;
  lastScroll = 0;

  componentDidMount() {
    if (this.containerRef && this.containerRef.current) {
      this.containerRef.current.style.touchAction = "none";

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
                  event[i] = fistTouchProperties[i];
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
            this.lastScroll = this.containerRef.current.scrollTop;

            const dataTransfer = new DataTransfer();
            event.dataTransfer = dataTransfer;
            const dragEvent = new DragEvent("dragstart", event);

            target.dispatchEvent(dragEvent);

            const ghostImage = target.cloneNode(true) as HTMLElement;

            ghostImage.style.position = "fixed";
            ghostImage.style.pointerEvents = "none";
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
              dragEvent
            };
          }

          return null;
        }),
        filter(x => !!x)
      );

      const mouseMove$ = fromEvent(this.containerRef.current, "mousemove").pipe(
        tap(e => {
          e.preventDefault();
        })
      );
      const touchMove$ = fromEvent(this.containerRef.current, "touchmove", {
        passive: true
      }).pipe(
        switchMap((event: any) =>
          of(event).pipe(
            pluck("touches", "0"),
            map((fistTouchProperties: any) => {
              for (let i in fistTouchProperties) {
                if (i !== "target") {
                  event[i] = fistTouchProperties[i];
                }
              }
              return event;
            })
          )
        )
      );
      const move$ = merge(mouseMove$, touchMove$).pipe(
        tap(x => {
          //  console.log(x, "whats coming in ");
        })
      );

      const mouseUp$ = fromEvent(
        this.containerRef.current,
        "mouseup"
      ) as Observable<MouseEvent>;
      const touchUp$ = fromEvent(this.containerRef.current, "touchend", {
        passive: true
      }) as Observable<TouchEvent>;

      const contextMenu = fromEvent(this.containerRef.current, "contextmenu");

      const up$ = merge(mouseUp$, touchUp$, contextMenu);

      this.eventSubscription = down$
        .pipe(
          switchMap(({ target, ghostImage, dataTransfer, dragEvent }: any) =>
            move$.pipe(
              tap((evt: any) => {
                let move = 0;

                if (this.containerRef.current) {
                  const targetTop = ghostImage.getBoundingClientRect();
                  const cont = this.containerRef.current.getBoundingClientRect();

                  //    console.log(targetTop, cont);

                  if (
                    cont.top > targetTop.top &&
                    this.containerRef.current.scrollTop !== 0
                  ) {
                    // while (this.containerRef.current.scrollTop > 0) {
                    //      console.log("before", this.containerRef.current.scrollTop);
                    this.containerRef.current.scrollTop =
                      this.containerRef.current.scrollTop - 7;

                    move = -7;

                    //      console.log("after", this.containerRef.current.scrollTop);

                    // ghostImage.style.top -= 2;
                    // }
                  }
                }

                if (this.containerRef.current && move === 0) {
                  TweenLite.to(ghostImage, 0, {
                    x:
                      +evt.clientX -
                      dragEvent.offsetX -
                      (dragEvent.target.offsetLeft -
                        this.containerRef.current.scrollLeft),
                    y:
                      +evt.clientY -
                      dragEvent.offsetY -
                      (dragEvent.target.offsetTop -
                        this.containerRef.current.scrollTop) +
                      (this.lastScroll - this.containerRef.current.scrollTop) +
                      move,

                    background: "red"
                  });
                }
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
            //          console.log(x);
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
        <div className={styles.c}>OTHER CONTER</div>
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

        <div className={styles.oop}>OOP</div>
      </div>
    );
  }
}
