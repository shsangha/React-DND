import * as React from "react";
import { Container, Draggable, Droppable } from "../../index";

import { RouteComponentProps } from "@reach/router";
import styles from "./style.module.scss";

console.log(styles);

export default (_: RouteComponentProps) => (
  <Container
    initialState={{
      one: [1, 2, 3, 4, 5],
      two: [6, 7, 8, 9, 10],
      three: [11, 12, 13, 14, 15]
    }}
  >
    {({ state: { values } }) => (
      <div data-cy="container" className={styles.container}>
        {Object.keys(values).map(name => (
          <>
            <Droppable key={name} name={name}>
              {() => (
                <div data-cy={`droppable_${name}`} className={styles[name]}>
                  {values[name].map((value, index) => (
                    <>
                      <Draggable index={index} key={value}>
                        {() => (
                          <div
                            data-cy={`draggable_${name}_${index}`}
                            className={styles.draggable}
                          >
                            {value}
                          </div>
                        )}
                      </Draggable>
                      <div className={styles.spacer} />
                    </>
                  ))}
                </div>
              )}
            </Droppable>
            <div className={styles.spacer} />
          </>
        ))}
      </div>
    )}
  </Container>
);
