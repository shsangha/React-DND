beforeEach(() => {
  cy.viewport(1000, 1000);
  cy.visit("/behavior/sort");
});

describe("tests logic for sort behavior on containers", () => {
  describe('"horizontal list sort without being cancelled"', () => {
    it("mouse", () => {
      cy.get("[data-cy^=draggable_horizontal]").then(el => {
        const vals = el.map(item => el[item].textContent);

        expect([...vals]).to.eql(["1", "2", "3", "4", "5"]);

        cy.get("[data-cy=draggable_horizontal_0]").then(element0 => {
          const rect = element0[0].getBoundingClientRect();

          const origin = {
            pageX: rect.x + rect.width / 2,
            pageY: rect.y + rect.height / 2
          };

          cy.wrap(element0).trigger("mousedown", {
            ...origin
          });

          cy.wrap(element0).trigger("mousemove");

          cy.get("[data-cy=draggable_horizontal_1]")
            .trigger("mousemove")
            .get("[data-cy^=draggable_horizontal]")
            .and($res => {
              expect($res[0].textContent).to.equal("2");
              expect($res[1].textContent).to.equal("1");
              expect($res[2].textContent).to.equal("3");
              expect($res[3].textContent).to.equal("4");
              expect($res[4].textContent).to.equal("5");
            })
            .get("[data-cy=draggable_horizontal_4]")
            .trigger("mousemove")
            .get("[data-cy^=draggable_horizontal]")
            .and($res => {
              expect($res[0].textContent).to.equal("2");
              expect($res[1].textContent).to.equal("3");
              expect($res[2].textContent).to.equal("4");
              expect($res[3].textContent).to.equal("5");
              expect($res[4].textContent).to.equal("1");
            })
            .window()
            .trigger("mouseup")
            .get("[data-cy^=draggable_horizontal]")
            .and($res => {
              expect($res[0].textContent).to.equal("2");
              expect($res[1].textContent).to.equal("3");
              expect($res[2].textContent).to.equal("4");
              expect($res[3].textContent).to.equal("5");
              expect($res[4].textContent).to.equal("1");
            });
        });
      });
    });
    it("keyboard", () => {
      //

      cy.get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2].textContent).to.equal("3");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .get("[data-cy=draggable_horizontal_1]")
        .trigger("keydown", { keyCode: 32 })
        .window()
        .trigger("keydown", { key: "ArrowRight" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("3");
          expect($res[2].textContent).to.equal("2");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .window()
        .trigger("keydown", { key: "ArrowRight" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("3");
          expect($res[2].textContent).to.equal("4");
          expect($res[3].textContent).to.equal("2");
          expect($res[4].textContent).to.equal("5");
        })
        .window()
        .trigger("keydown", { key: "ArrowRight" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("3");
          expect($res[2].textContent).to.equal("4");
          expect($res[3].textContent).to.equal("5");
          expect($res[4].textContent).to.equal("2");
        })
        .window()
        .trigger("keydown", { key: "ArrowRight" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("3");
          expect($res[2].textContent).to.equal("4");
          expect($res[3].textContent).to.equal("5");
          expect($res[4].textContent).to.equal("2");
        })
        .window()
        .trigger("keydown", { keyCode: 32, key: " " })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("3");
          expect($res[2].textContent).to.equal("4");
          expect($res[3].textContent).to.equal("5");
          expect($res[4].textContent).to.equal("2");
        });
    });
  });

  describe("defaults back to inital state when cancel action triggered", () => {
    it("mouse", () => {
      cy.get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2].textContent).to.equal("3");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .get("[data-cy=draggable_horizontal_2]")
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
            .get("[data-cy=draggable_horizontal_0]")
            .trigger("mousemove")
            .get("[data-cy^=draggable_horizontal]")
            .and($res => {
              expect($res[0].textContent).to.equal("3");
              expect($res[1].textContent).to.equal("1");
              expect($res[2].textContent).to.equal("2");
              expect($res[3].textContent).to.equal("4");
              expect($res[4].textContent).to.equal("5");
            })
            .window()
            .trigger("mouseup", { clientX: 0, clientY: 0 })
            .get("[data-cy^=draggable_horizontal]")
            .and($res => {
              expect($res[0].textContent).to.equal("1");
              expect($res[1].textContent).to.equal("2");
              expect($res[2].textContent).to.equal("3");
              expect($res[3].textContent).to.equal("4");
              expect($res[4].textContent).to.equal("5");
            });
        });
    });
    it("keyboard", () => {
      cy.get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2].textContent).to.equal("3");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .get("[data-cy=draggable_horizontal_2]")
        .trigger("keydown", { keyCode: 32 })
        .window()
        .trigger("keydown", { key: "ArrowLeft" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("3");
          expect($res[2].textContent).to.equal("2");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .window()
        .trigger("keydown", { key: "ArrowLeft" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("3");
          expect($res[1].textContent).to.equal("1");
          expect($res[2].textContent).to.equal("2");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .window()
        .trigger("keydown", { key: "ArrowLeft" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("3");
          expect($res[1].textContent).to.equal("1");
          expect($res[2].textContent).to.equal("2");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        })
        .window()
        .trigger("keydown", { key: "Escape" })
        .get("[data-cy^=draggable_horizontal]")
        .and($res => {
          expect($res[0].textContent).to.equal("1");
          expect($res[1].textContent).to.equal("2");
          expect($res[2].textContent).to.equal("3");
          expect($res[3].textContent).to.equal("4");
          expect($res[4].textContent).to.equal("5");
        });
    });
  });

  describe("multi container sorting works as expected", () => {
    describe("mouse tests", () => {
      it("appends to the end of the droppable if not dragging over an existing draggable", () => {
        cy.get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("2");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("4");
            expect($res[4].textContent).to.equal("5");
          })
          .get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("8");
            expect($res[3].textContent).to.equal("9");
            expect($res[4].textContent).to.equal("10");
          })
          .get("[data-cy=draggable_horizontal_2]")
          .trigger("mousedown")
          .trigger("mousemove")
          .get("[data-cy=vertical_spacer]")
          .trigger("mousemove")
          .get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("8");
            expect($res[3].textContent).to.equal("9");
            expect($res[4].textContent).to.equal("10");
            expect($res[5].textContent).to.equal("3");
          })
          .get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("2");
            expect($res[2].textContent).to.equal("4");
            expect($res[3].textContent).to.equal("5");
          });
      });

      it("moves the element to the dragged over position if a draggable is already there", () => {
        cy.get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("2");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("4");
            expect($res[4].textContent).to.equal("5");
          })
          .get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("8");
            expect($res[3].textContent).to.equal("9");
            expect($res[4].textContent).to.equal("10");
          })
          .get("[data-cy=draggable_horizontal_2]")
          .trigger("mousedown")
          .trigger("mousemove")
          .get("[data-cy=draggable_vertical_2]")
          .trigger("mousemove")
          .get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("8");
            expect($res[4].textContent).to.equal("9");
            expect($res[5].textContent).to.equal("10");
          })
          .get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("2");
            expect($res[2].textContent).to.equal("4");
            expect($res[3].textContent).to.equal("5");
          });
      });

      it("ignores the drop if at capacity", () => {
        cy.get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("2");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("4");
            expect($res[4].textContent).to.equal("5");
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
          .get("[data-cy=draggable_horizontal_2]")
          .trigger("mousedown")
          .trigger("mousemove")
          .get("[data-cy=draggable_grid_2]")
          .trigger("mousemove")
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("13");
            expect($res[4].textContent).to.equal("14");
            expect($res[5].textContent).to.equal("15");
            expect($res[6].textContent).to.equal("16");
          })
          .get("[data-cy=draggable_grid_2]")
          .trigger("mousemove")
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("13");
            expect($res[4].textContent).to.equal("14");
            expect($res[5].textContent).to.equal("15");
            expect($res[6].textContent).to.equal("16");
          });
      });
    });
    describe("keyboard tests", () => {
      it("appends to the end of the targeted draggable", () => {
        cy.get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("2");
            expect($res[2].textContent).to.equal("3");
            expect($res[3].textContent).to.equal("4");
            expect($res[4].textContent).to.equal("5");
          })
          .get("[data-cy=draggable_horizontal_1]")
          .trigger("keydown", { keyCode: 32 })
          .window()
          .trigger("keydown", "ArrowUp")
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("13");
            expect($res[3].textContent).to.equal("14");
            expect($res[4].textContent).to.equal("15");
            expect($res[5].textContent).to.equal("16");
          })
          .window()
          .trigger("keydown", { key: "ArrowDown" })
          .get("[data-cy^=draggable_horizontal]")
          .and($res => {
            expect($res[0].textContent).to.equal("1");
            expect($res[1].textContent).to.equal("3");
            expect($res[2].textContent).to.equal("4");
            expect($res[3].textContent).to.equal("5");
          })
          .get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("8");
            expect($res[3].textContent).to.equal("9");
            expect($res[4].textContent).to.equal("10");
            expect($res[5].textContent).to.equal("2");
          })
          .window()
          .trigger("keydown", { key: "ArrowDown" })
          .get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("8");
            expect($res[3].textContent).to.equal("9");
            expect($res[4].textContent).to.equal("10");
            expect($res[5]).not.to.exist;
          })
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("13");
            expect($res[3].textContent).to.equal("14");
            expect($res[4].textContent).to.equal("15");
            expect($res[5].textContent).to.equal("16");
            expect($res[6].textContent).to.equal("2");
          })
          .window()
          .trigger("keydown", { key: "ArrowDown" })
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("13");
            expect($res[3].textContent).to.equal("14");
            expect($res[4].textContent).to.equal("15");
            expect($res[5].textContent).to.equal("16");
            expect($res[6].textContent).to.equal("2");
          });
      });

      it("handles capacity as expected", () => {
        cy.get("[data-cy^=draggable_vertical]")
          .and($res => {
            expect($res[0].textContent).to.equal("6");
            expect($res[1].textContent).to.equal("7");
            expect($res[2].textContent).to.equal("8");
            expect($res[3].textContent).to.equal("9");
            expect($res[4].textContent).to.equal("10");
          })
          .get("[data-cy=draggable_vertical_2]")
          .trigger("keydown", { keyCode: 32 })
          .window()
          .trigger("keydown", { key: "ArrowDown" })
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("13");
            expect($res[3].textContent).to.equal("14");
            expect($res[4].textContent).to.equal("15");
            expect($res[5].textContent).to.equal("16");
            expect($res[6].textContent).to.equal("8");
          })
          .window()
          .trigger("keydown", { keyCode: 32 })
          .get("[data-cy=draggable_vertical_2]")
          .trigger("keydown", { keyCode: 32 })
          .window()
          .trigger("keydown", { key: "ArrowDown" })
          .get("[data-cy^=draggable_grid]")
          .and($res => {
            expect($res[0].textContent).to.equal("11");
            expect($res[1].textContent).to.equal("12");
            expect($res[2].textContent).to.equal("13");
            expect($res[3].textContent).to.equal("14");
            expect($res[4].textContent).to.equal("15");
            expect($res[5].textContent).to.equal("16");
            expect($res[6].textContent).to.equal("8");
          });
      });
    });
  });
});
