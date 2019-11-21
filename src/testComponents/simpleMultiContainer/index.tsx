import React from "react";
import Container from "../../container";
import Draggable from "../../draggable";
import Droppable from "../../droppable";
import { RouteComponentProps } from "@reach/router";
import styles from "./style.module.scss";

export default (behavior: "sort" | "swap" | "append" | "shift") => (
  props: RouteComponentProps
) => (
  <Container
    initialState={{
      horizontal: [1, 2, 3, 4, 5],
      vertical: [6, 7, 8, 9, 10],
      grid: [11, 12, 13, 14, 15, 16]
    }}
  >
    {({ state: { values } }) => (
      <div className={styles.container}>
        {Object.keys(values).map(name => (
          <Droppable cap={7} behavior={behavior} key={name} name={name}>
            {() => (
              <div data-cy={`droppable_${name}`} className={styles[name]}>
                {values[name].map((value, index) => (
                  <Draggable index={index} key={value}>
                    {() => (
                      <div
                        data-cy={`draggable_${name}_${index}`}
                        className={`${styles[`${name}Draggable`]}`}
                      >
                        {value}
                      </div>
                    )}
                  </Draggable>
                ))}
                <div
                  data-cy={`${name}_spacer`}
                  className={`${styles[`${name}Draggable`]}`}
                >
                  spacer
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    )}
  </Container>
);
