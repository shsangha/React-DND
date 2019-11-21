import React from "react";
import Container from "../../container";
import Droppable from "../../droppable";
import Draggable from "../../draggable";
import { RouteComponentProps } from "@reach/router";

export default (props: RouteComponentProps) => (
  <Container
    initialState={{
      test: [1]
    }}
  >
    {() => (
      <div>
        <Droppable name="test">
          {() => (
            <div>
              <Draggable index={0}>
                {() => <div data-cy="dragel">Test</div>}
              </Draggable>
            </div>
          )}
        </Droppable>
      </div>
    )}
  </Container>
);
