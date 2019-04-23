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
  throttleTime,
  skip,
  startWith
} from "rxjs/operators";
import { TweenLite } from "gsap";

export default class Container extends Component {
  containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  testRef: React.RefObject<HTMLDivElement> = React.createRef();
  eventSubscription?: Subscription;

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

      const mouseMove$ = fromEvent(this.containerRef.current, "mousemove");
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
                TweenLite.to(ghostImage, 0, {
                  x:
                    +evt.clientX -
                    dragEvent.offsetX -
                    dragEvent.target.offsetLeft,
                  y:
                    +evt.clientY -
                    dragEvent.offsetY -
                    dragEvent.target.offsetTop,
                  background: "greenyellow"
                });
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
        <div>OTHER CONTER</div>
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
