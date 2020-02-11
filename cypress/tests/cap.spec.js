beforeEach(() => {
  cy.viewport(1000, 1000);
  cy.visit("/behavior/shift");
});

describe("it ignored drops when at capacity dragging", () => {
  it("touch/mouse", () => {
    cy.get("[data-cy^=draggable_vertical]")
      .and($res => {
        expect($res[0].textContent).to.equal("6");
        expect($res[1].textContent).to.equal("7");
        expect($res[2].textContent).to.equal("8");
        expect($res[3].textContent).to.equal("9");
        expect($res[4].textContent).to.equal("10");
      })
      .get("[data-cy^=draggable_grid]")
      .and($res => {
        expect($res[0].textContent).to.equal("11");
        expect($res[1].textContent).to.equal("12");
        expect($res[2].textContent).to.equal("13");
        expect($res[3].textContent).to.equal("14");
        expect($res[4].textContent).to.equal("15");
        expect($res[5].textContent).to.equal("16");
      })
      .get("[data-cy=draggable_vertical_1]")
      .then(el => {
        const rect = el[0].getBoundingClientRect();

        const origin = {
          pageX: rect.x + rect.width / 2,
          pageY: rect.y + rect.height / 2
        };

        cy.wrap(el)
          .trigger("mousedown", {
            ...origin
          })
          .trigger("mousemove")
          .get("[data-cy=draggable_grid_1]")
          .trigger("mousemove")
          .trigger("mousemove")
          .get("[data-cy=droppable_grid]")
          .children()
          .and($res => {
            expect($res[0].textContent).to.equal("7");
            expect($res[1].textContent).to.equal("11");
            expect($res[2].textContent).to.equal("12");
            expect($res[3].textContent).to.equal("13");
            expect($res[4].textContent).to.equal("14");
            expect($res[5].textContent).to.equal("15");
            expect($res[6].textContent).to.equal("16");
          })
          .window()
          .trigger("mouseup")
          .get("[data-cy=draggable_vertical_2]")
          .then(el => {
            const rect = el[0].getBoundingClientRect();

            const origin = {
              pageX: rect.x + rect.width / 2,
              pageY: rect.y + rect.height / 2
            };

            cy.wrap(el)
              .trigger("mousedown", {
                ...origin
              })
              .trigger("mousemove")
              .get("[data-cy=draggable_grid_1]")
              .trigger("mousemove")
              .trigger("mousemove")
              .get("[data-cy=droppable_grid]")
              .children()
              .and($res => {
                expect($res[0].textContent).to.equal("7");
                expect($res[1].textContent).to.equal("11");
                expect($res[2].textContent).to.equal("12");
                expect($res[3].textContent).to.equal("13");
                expect($res[4].textContent).to.equal("14");
                expect($res[5].textContent).to.equal("15");
                expect($res[6].textContent).to.equal("16");
              });
          });
      });
  });

  it("keyboard", () => {
    cy.get("[data-cy^=draggable_vertical]")
      .and($res => {
        expect($res[0].textContent).to.equal("6");
        expect($res[1].textContent).to.equal("7");
        expect($res[2].textContent).to.equal("8");
        expect($res[3].textContent).to.equal("9");
        expect($res[4].textContent).to.equal("10");
      })
      .get("[data-cy^=draggable_grid]")
      .and($res => {
        expect($res[0].textContent).to.equal("11");
        expect($res[1].textContent).to.equal("12");
        expect($res[2].textContent).to.equal("13");
        expect($res[3].textContent).to.equal("14");
        expect($res[4].textContent).to.equal("15");
        expect($res[5].textContent).to.equal("16");
      })
      .get("[data-cy=draggable_vertical_1]")
      .trigger("keydown", { keyCode: 32 })
      .window()
      .trigger("keydown", { key: "ArrowDown" })
      .get("[data-cy^=draggable_grid]")
      .and($res => {
        expect($res[0].textContent).to.equal("7");
        expect($res[1].textContent).to.equal("11");
        expect($res[2].textContent).to.equal("12");
        expect($res[3].textContent).to.equal("13");
        expect($res[4].textContent).to.equal("14");
        expect($res[5].textContent).to.equal("15");
        expect($res[6].textContent).to.equal("16");
      })
      .window()
      .trigger("keydown", { keyCode: 32 })
      .get("[data-cy=draggable_vertical_2]")
      .trigger("keydown", {
        keyCode: 32
      })
      .window()
      .trigger("keydown", {
        key: "ArrowDown"
      })
      .get("[data-cy^=draggable_grid]")
      .and($res => {
        expect($res[0].textContent).to.equal("7");
        expect($res[1].textContent).to.equal("11");
        expect($res[2].textContent).to.equal("12");
        expect($res[3].textContent).to.equal("13");
        expect($res[4].textContent).to.equal("14");
        expect($res[5].textContent).to.equal("15");
        expect($res[6].textContent).to.equal("16");
      })
      .window()
      .trigger("keydown", { key: "ArrowUp" })
      .get("[data-cy^=draggable_horizontal]")
      .and($res => {
        expect($res[0].textContent).to.equal("9");
        expect($res[1].textContent).to.equal("1");
        expect($res[2].textContent).to.equal("2");
        expect($res[3].textContent).to.equal("3");
        expect($res[4].textContent).to.equal("4");
        expect($res[5].textContent).to.equal("5");
      });
  });
});
