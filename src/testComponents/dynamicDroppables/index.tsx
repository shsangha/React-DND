import * as React from "react";
import { Container, Draggable, Droppable } from "../../index";
import { RouteComponentProps } from "@reach/router";

export default (_: RouteComponentProps) => (
  <div>
    <Container
      initialState={{
        one: [1, 2, 3]
      }}
    >
      {({ state: { values } }) => (
        <div data-cy="container_droppableTest">
          {Object.keys(values).map(name => (
            <Droppable key={name} name={name}>
              {({
                removeCurrentDroppable,
                removeDraggableAtIndex,
                insertInDraggable
              }) => {
                const remove2 = () => {
                  removeDraggableAtIndex(2);
                };

                const insert = () => {
                  insertInDraggable(4);
                  insertInDraggable(5, 1);
                };

                return (
                  <div>
                    <div
                      data-cy="droppableTest_removeDroppable"
                      onClick={removeCurrentDroppable}
                    >
                      remove Droppable
                    </div>
                    <div
                      data-cy="droppableTest_removeDraggable"
                      onClick={remove2}
                    >
                      remove Draggable
                    </div>
                    <div data-cy="droppableTest_insert" onClick={insert}>
                      Insert{" "}
                    </div>
                    {values[name].map((item, index) => (
                      <div
                        key={item}
                        data-cy={`droppableTest_draggable_${index}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                );
              }}
            </Droppable>
          ))}
        </div>
      )}
    </Container>

    <Container
      initialState={{
        one: [1, 2, 3]
      }}
    >
      {({ state: { values } }) => (
        <div>
          <Droppable name="one">
            {() => (
              <div>
                {values.one.map((item, index) => (
                  <Draggable index={index} key={item}>
                    {({ removeOnClick }) => (
                      <div>
                        <div
                          data-cy={`draggableTest_${index}`}
                          {...removeOnClick()}
                        >
                          {item}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Container>

    <Container
      initialState={{
        one: [1, 2, 3],
        two: [4, 5, 6]
      }}
    >
      {({
        state: { values },
        removeDraggable,
        removeDroppable,
        insertDraggable,
        insertDroppable
      }) => {
        const removeOne = () => {
          removeDroppable("one");
        };

        const removeDraggable2 = () => {
          removeDraggable("one", 2);
        };

        const insert3rdDroppable = () => {
          insertDroppable("three", [7, 8, 9]);
        };

        const insertDraggables = () => {
          insertDraggable("one", 7);
          insertDraggable("one", 8, 1);
        };

        return (
          <div>
            {Object.keys(values).map(name => (
              <Droppable name={name} key={name}>
                {() => (
                  <div data-cy={`containerTest_droppable_${name}`}>
                    {values[name].map((item, index) => (
                      <Draggable key={item} index={index}>
                        {() => (
                          <div
                            data-cy={`containerTest_draggable_${name}_${index}`}
                          >
                            {item}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            ))}
            <div data-cy="removeOne" onClick={removeOne}>
              Remove One
            </div>
            <div data-cy="removeDraggable2" onClick={removeDraggable2}>
              Remove Draggable 2
            </div>
            <div data-cy="addThirdDroppable" onClick={insert3rdDroppable}>
              Insert third droppable
            </div>
            <div data-cy="insertDraggables" onClick={insertDraggables}>
              Insert Draggables
            </div>
          </div>
        );
      }}
    </Container>
  </div>
);
