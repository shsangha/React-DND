import React from "react";
import "./styles.scss";
import { Container, Draggable, Droppable } from "../index";

import kyle from "./kyle.png";
import chris from "./chris.png";
import dewan from "./dewan.png";
import fred from "./fred.png";
import malcom from "./malcom.png";
import marc from "./marc.png";
import matt from "./matt.png";
import norm from "./norm.png";
import og from "./og.png";
import pascal from "./pascal.png";
import pat from "./pat.png";
import rondae from "./rondae.png";
import serge from "./serge.png";
import { RouteComponentProps } from "@reach/router";

export default (_: RouteComponentProps) => {
  return (
    <Container
      initialState={{
        horizontal: [kyle, chris, dewan],
        vertical: [fred, malcom, marc, matt, norm],
        grid: [og, pascal, pat, rondae, serge]
      }}
    >
      {({ state: { values } }) => {
        return (
          <div className="page">
            <h1 className="header">
              Use Spacebar to toggle keyboard dragging. Arrow left/right to move
              within containers. Arrow up/down to move between containers.
            </h1>
            <div className="content">
              <div className="horizontal_wrapper">
                <h2 className="category">G-Leauge</h2>
                <Droppable name="horizontal">
                  {() => (
                    <div className="horizontal_droppable">
                      {values.horizontal.map((src: string, index) => {
                        return (
                          <Draggable index={index} key={src}>
                            {() => <img className="horizontal_img" src={src} />}
                          </Draggable>
                        );
                      })}
                    </div>
                  )}
                </Droppable>
              </div>

              <div className="vertical_wrapper">
                <h2 className="category">Bench</h2>
                <Droppable name="vertical">
                  {() => (
                    <div className="vertical_droppable">
                      {values.vertical.map((src, index) => {
                        return (
                          <Draggable index={index} key={src}>
                            {() => <img className="vertical_img " src={src} />}
                          </Draggable>
                        );
                      })}
                    </div>
                  )}
                </Droppable>
              </div>
              <div className="grid_wrapper">
                <h2 className="category">Starters</h2>
                <Droppable name="grid">
                  {() => (
                    <div className="grid_droppable">
                      {values.grid.map((src, index) => {
                        return (
                          <Draggable index={index} key={src}>
                            {() => <img className="grid_img " src={src} />}
                          </Draggable>
                        );
                      })}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        );
      }}
    </Container>
  );
};
