import * as React from "react";
import { Container, Draggable, Droppable } from "../../index";

import { RouteComponentProps } from "@reach/router";

export default (_: RouteComponentProps) => (
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
