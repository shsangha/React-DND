// this doesnt need cypress at all just doing it here instead of jest to demonstate familiarity with cypress
const PLACEHOLDER_ID = "react_dnd_placeholder_element_id";

beforeEach(() => {
  cy.visit("/dynamicDroppable");
});

describe("tests the utility functions that allow dynamic addition and deletion of dragagables/dropppables", () => {
  describe("tests the container fns exposed to render props", () => {
    it("can remove droppables", () => {
      cy.get("[data-cy=containerTest_droppable_one]")
        .should("exist")
        .get("[data-cy=removeOne]")
        .trigger("click")
        .get("[data-cy=containerTest_droppable_one]")
        .should("not.exist");
    });

    it("can remove draggables", () => {
      cy.get("[data-cy^=containerTest_draggable_one]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2].textContent).to.equal("3");
        })
        .get("[data-cy=removeDraggable2]")
        .trigger("click")
        .get("[data-cy^=containerTest_draggable_one]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2]).not.to.exist;
        });
    });

    it("can insert droppables", () => {
      cy.get("[data-cy=containerTest_droppable_three]")
        .should("not.exist")
        .get("[data-cy=addThirdDroppable]")
        .trigger("click")
        .get("[data-cy=containerTest_droppable_three]")
        .should("exist");
    });

    it("can insert draggables", () => {
      cy.get("[data-cy^=containerTest_draggable_one_]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2].textContent).to.equal("3");
        })
        .get("[data-cy=insertDraggables]")
        .trigger("click")
        .get("[data-cy^=containerTest_draggable_one_]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("8");
          expect($res[2].textContent).to.equal("2");
          expect($res[3].textContent).to.equal("3");
          expect($res[4].textContent).to.equal("7");
        });
    });
  });

  it("droppable fns", () => {
    cy.get("[data-cy^=droppableTest_draggable_]")
      .and($res => {
        expect($res[0].textContent).to.equal("1");
        expect($res[1].textContent).to.equal("2");
        expect($res[2].textContent).to.equal("3");
      })
      .get("[data-cy=droppableTest_insert]")
      .trigger("click")
      .get("[data-cy^=droppableTest_draggable_]")
      .and($res => {
        expect($res[0].textContent).to.equal("1");
        expect($res[1].textContent).to.equal("5");
        expect($res[2].textContent).to.equal("2");
        expect($res[3].textContent).to.equal("3");
        expect($res[4].textContent).to.equal("4");
      })
      .get("[data-cy=droppableTest_removeDraggable]")
      .trigger("click")
      .get("[data-cy^=droppableTest_draggable_]")
      .and($res => {
        expect($res[0].textContent).to.equal("1");
        expect($res[1].textContent).to.equal("5");
        expect($res[2].textContent).to.equal("3");
        expect($res[3].textContent).to.equal("4");
      })
      .get("[data-cy=droppableTest_removeDroppable]")
      .trigger("click")
      .get("[data-cy^=droppableTest_draggable_]")
      .should("not.exist");
  });

  it("remove on click for draggable", () => {
    cy.get("[data-cy^=draggableTest_]")
      .and($res => {
        expect($res[0].textContent).to.equal("1");
        expect($res[1].textContent).to.equal("2");
        expect($res[2].textContent).to.equal("3");
      })
      .get("[data-cy^=draggableTest_1]")
      .trigger("mousedown")
      .get("[data-cy^=draggableTest_]")
      .get("[data-cy^=draggableTest_]")
      .and($res => {
        expect($res[0].textContent).to.equal("1");
        expect($res[1].textContent).to.equal("3");
      })
      .get(`#${PLACEHOLDER_ID}`)
      .should("not.exist");
  });
});
