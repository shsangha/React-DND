import React from "react";
import { render } from "react-dom";
import Container from "./container";
import Draggable from "./draggable";
import Droppable from "./droppable";

const App = () => (
  <div>
    <Container>
      {state => {
        return (
          <>
            <Droppable name="name">
              {state.values.name.map((name: any, index: any) => (
                <Draggable key={name} index={index}>
                  <div style={{ width: "300px" }}>{name}</div>
                </Draggable>
              ))}
            </Droppable>
            <Droppable name="age">
              {state.values.age.map((name: any, index: any) => (
                <Draggable key={name} index={index}>
                  <div style={{ width: "100px" }}>{name}</div>
                </Draggable>
              ))}
            </Droppable>
            <Droppable name="smell">
              <div
                style={{ background: "red", width: "200px", height: "200px" }}
              >
                {state.values.smell.map(() => (
                  <div>BOIIII</div>
                ))}
              </div>
            </Droppable>
            <div style={{ height: "600vh", width: "600vw" }} />
          </>
        );
      }}
    </Container>
  </div>
);

render(<App />, document.getElementById("react-root"));
