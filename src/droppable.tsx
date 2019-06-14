import React from "react";
import { DragContext } from "./context";
interface Props {
  index: number;
  disabled: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
}

export default (props: any) => {
  return (
    <DragContext.Consumer>
      {args => {
        return <div>Droppable</div>;
      }}
    </DragContext.Consumer>
  );
};
