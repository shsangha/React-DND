import React, { Component } from "react";
import {
  Subscription,
  throwError,
  merge,
  fromEvent,
  of,
  iif,
  forkJoin,
  NEVER
} from "rxjs";
import {
  switchMap,
  pluck,
  map,
  filter,
  tap,
  takeUntil,
  finalize
} from "rxjs/operators";
import styles from "./style.module.scss";
import { TweenLite } from "gsap";

export default class Container extends Component {
  public containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  public eventSubscription?: Subscription;

  public down$ = () => {
    return this.containerRef.current
      ? merge(
          fromEvent<TouchEvent>(this.containerRef.current, "touchstart", {
            passive: true
          }),
          fromEvent<MouseEvent>(this.containerRef.current, "mousedown")
        ).pipe(
          switchMap(downEvent =>
            of(this.getDraggableTarget(downEvent.target)).pipe(
              filter((el): el is HTMLElement => !!el),
              switchMap(target => {
                const dataTransfer = new DataTransfer();
                return this.createDragEvent(
                  downEvent,
                  "dragstart",
                  dataTransfer
                ).pipe(
                  tap(dragStartEvent => {
                    target.dispatchEvent(dragStartEvent);
                  }),
                  switchMap(dragStartEvent =>
                    this.createDragEvent(
                      downEvent,
                      "dragenter",
                      dataTransfer
                    ).pipe(
                      switchMap(dragEnterEvent =>
                        of(this.createGhostImage(target)).pipe(
                          tap(() => {
                            target.dispatchEvent(dragEnterEvent);
                          }),
                          switchMap(ghostImage =>
                            this.containerRef.current
                              ? forkJoin({
                                  target: of(target),
                                  ghostImage: of(ghostImage),
                                  dataTransfer: of(dataTransfer),
                                  offsets: of({
                                    windowX: window.scrollX,
                                    windowY: window.scrollY,
                                    containerX: this.containerRef.current
                                      .scrollLeft,
                                    containerY: this.containerRef.current
                                      .scrollTop,
                                    clientX: dragStartEvent.pageX,
                                    clientY: dragStartEvent.pageY
                                  })
                                })
                              : throwError("No container to attach to")
                          )
                        )
                      )
                    )
                  )
                );
              })
            )
          )
        )
      : throwError("No container to attach to");
  };

  public move$ = (
    offsets: { windowX: number; windowY: number },
    ghostImage: HTMLElement
  ) =>
    merge(
      fromEvent<MouseEvent>(window, "mousemove"),
      fromEvent<TouchEvent>(window, "touchmove", {
        passive: true
      })
    ).pipe(
      tap(moveEvent => {
        moveEvent.preventDefault();
      }),
      tap(moveEvent => {
        this.moveGhostImage(
          moveEvent instanceof TouchEvent ? moveEvent.touches[0] : moveEvent,
          offsets,
          ghostImage
        );
      }),
      tap(a => {
        console.log(
          this.getCurrentTarget(a instanceof TouchEvent ? a.touches[0] : a),
          "targ"
        );
      })
    );

  public up$ = () =>
    merge(
      fromEvent(window, "mouseup"),
      fromEvent(window, "touchend"),
      this.containerRef.current
        ? fromEvent(this.containerRef.current, "contextmenu")
        : throwError("No container to attach to ")
    );

  public componentDidMount() {
    this.down$()
      .pipe(
        switchMap(({ target, offsets, ghostImage, dataTransfer }) =>
          this.move$(offsets, ghostImage).pipe(
            takeUntil(this.up$()),
            finalize(() => {
              if (this.containerRef.current) {
                this.containerRef.current.removeChild(ghostImage);
              }
            })
          )
        )
      )
      .subscribe({
        next(c) {
          //    console.log(c);
        },
        error(e) {
          console.log(e);
        },
        complete() {
          console.log("done");
        }
      });
  }

  // clean up subscription
  public componentWillUnmount() {}

  public getCurrentTarget = (x: any) =>
    this.getDraggableTarget(document.elementFromPoint(x.pageX, x.pageY));

  public createDragEvent = (
    event: TouchEvent | MouseEvent,
    type: string,
    dataTransfer: DataTransfer
  ) =>
    of(event).pipe(
      map(originalEvent => new DragEvent(type, originalEvent)),
      map(dragEvent => {
        Object.defineProperty(dragEvent, "dataTransfer", {
          value: dataTransfer,
          writable: false
        });
        return dragEvent;
      }),
      switchMap(dragEvent =>
        iif(
          () => event instanceof TouchEvent && type !== "dragend",
          of(dragEvent).pipe(
            switchMap(() =>
              this.copyFirstTouchProps(event as TouchEvent, dragEvent)
            )
          ),
          of(dragEvent)
        )
      )
    );

  public copyFirstTouchProps = (event: TouchEvent, dragEvent: DragEvent) =>
    of(event).pipe(
      pluck("touches", "0"),
      map((fistTouchProperties: any) => {
        for (const i in fistTouchProperties) {
          if (i !== "target") {
            Object.defineProperty(dragEvent, i, {
              value: fistTouchProperties[i],
              writable: false
            });
          }
        }

        return dragEvent;
      })
    );

  public createGhostImage = (target: HTMLElement) => {
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
    throw new Error("No container to attach to ");
  };

  public moveGhostImage = (event: any, offsets: any, ghostImage: any) => {
    console.log(offsets.containerY);
    if (this.containerRef.current) {
      const y = event.clientY - offsets.clientY + offsets.windowY;

      TweenLite.to(ghostImage, 0, {
        y,
        background: "blue"
      });
    }
  };

  public getDraggableTarget = (element: any): HTMLElement | null => {
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

  public render() {
    return (
      <div ref={this.containerRef} className={styles.rxcont}>
        <div
          react-draggable="true"
          in-dec={3}
          onDragEnter={e => {
            console.log("enter");
            e.preventDefault();
          }}
          onDragStart={e => {
            e.preventDefault();
            console.log("start");
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
          second
        </div>

        <div
          react-draggable="true"
          onDragStart={e => {
            e.preventDefault();

            e.dataTransfer.setData("dragContent", "ssjdfsd");
          }}
          className={styles.other}
        >
          third
        </div>

        <div
          react-draggable="true"
          onDragStart={e => {
            e.preventDefault();

            e.dataTransfer.setData("dragContent", "ssjdfsd");
          }}
          className={styles.other}
        >
          fourth
        </div>
      </div>
    );
  }
}
