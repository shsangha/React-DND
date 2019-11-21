import React, { Component } from "react";
import { render } from "react-dom";
import Container from "./container";
import Draggable from "./draggable";
import Droppable from "./droppable";
import { Router, RouteComponentProps, Link } from "@reach/router";
import PlaceholderMovement from "./testComponents/PlaceholderMovement";
import SimpleMultiContainer from "./testComponents/simpleMultiContainer";
import Scrolling from "./testComponents/scrolling";
import DynamicDroppable from "./testComponents/dynamicDroppables";

const BehaviorTests = (path: RouteComponentProps) => {
  const Sort = SimpleMultiContainer("sort");
  const Swap = SimpleMultiContainer("swap");
  const Append = SimpleMultiContainer("append");
  const Shift = SimpleMultiContainer("shift");

  return (
    <Router primary={false}>
      <Sort path="sort" />
      <Swap path="swap" />
      <Append path="append" />
      <Shift path="shift" />
    </Router>
  );
};

const App = () => (
  <Router>
    <PlaceholderMovement path="placeholderMovement" />
    <BehaviorTests path="behavior/*" />
    <Scrolling path="scrolling" />
    <DynamicDroppable path="dynamicDroppable" />
  </Router>
);

render(<App />, document.getElementById("react-root"));
