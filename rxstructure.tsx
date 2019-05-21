import React, { Component } from "react";
import { fromEvent, Subscription } from "rxjs";
import styles from "./style.module.scss";
import { switchMap, tap, takeUntil, debounceTime } from "rxjs/operators";

export default class Container extends Component {
  containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  eventSubscription?: Subscription;

  componentDidMount() {
    if (this.containerRef && this.containerRef.current) {
      const down$ = fromEvent(this.containerRef.current, "mousedown");
      const move$ = fromEvent(this.containerRef.current, "mousemove");
      const up$ = fromEvent(this.containerRef.current, "mouseup");

      this.eventSubscription = down$
        .pipe(
          tap(x => {
            console.log("do the setup here");
          }),
          switchMap(x =>
            move$.pipe(
              debounceTime(10),
              takeUntil(
                up$.pipe(
                  tap(() => {
                    console.log("done");
                  })
                )
              )
            )
          )
        )
        .subscribe({
          next(x) {
            console.log("emitted");
          },
          error() {
            console.log("error");
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

  render() {
    return <div ref={this.containerRef} className={styles.rxcont} />;
  }
}
