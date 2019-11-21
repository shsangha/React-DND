beforeEach(() => {
  cy.viewport(1000, 1000);
  cy.visit("/scrolling");
});

describe("tests to make sure scrolling works when dragging via mouse/touch", () => {
  describe("tests scrolling for mouse/touch users", () => {
    it("scrolls droppable when moving away from the droppable", () => {
      cy.get("[data-cy=draggable_one_1]").then(el => {
        const rect = el[0].getBoundingClientRect();

        const origin = {
          pageX: rect.x + rect.width / 2,
          pageY: rect.y + rect.height / 2
        };

        cy.wrap(el)
          .trigger("mousedown", { ...origin })
          .trigger("mousemove");

        cy.get("[data-cy=draggable_one_2]").then(el => {
          const rect = el[0].getBoundingClientRect();

          const origin = {
            pageX: rect.x,
            pageY: rect.y
          };

          cy.wrap(el)
            .trigger("mousemove")
            .get("[data-cy=droppable_one]")
            .and($res => {
              expect($res[0].scrollTop).to.equal(0);
              expect($res[0].scrollLeft).to.equal(0);
            })
            .get("[data-cy=droppable_one]")
            .then(el => {
              const rect = el[0].getBoundingClientRect();

              cy.window()
                .trigger("mousemove", {
                  clientX: rect.x + rect.width + 10,
                  clientY: rect.y + rect.height + 90
                })
                .trigger("mousemove", {
                  clientX: rect.x + rect.width + 20,
                  clientY: rect.y + rect.height + 100
                })
                .wait(200)
                .trigger("mousemove", {
                  clientX: rect.x + rect.width + 10,
                  clientY: rect.y + rect.height + 90
                })
                .get("[data-cy=droppable_one]")
                .and($res => {
                  expect($res[0].scrollTop).to.equal(20);
                  expect($res[0].scrollLeft).to.equal(20);
                })
                .window()
                .trigger("mousemove", {
                  clientX: rect.x - 10,
                  clientY: rect.y - 10
                })
                .get("[data-cy=droppable_one]")
                .and($res => {
                  expect($res[0].scrollTop).to.equal(0);
                  expect($res[0].scrollLeft).to.equal(0);
                });
            });
        });
      });
    });

    it("scrolls the container if the droppable is already scrolled in each given direction", () => {
      cy.get("[data-cy=draggable_one_1]").then(el => {
        const rect = el[0].getBoundingClientRect();

        const origin = {
          pageX: rect.x + rect.width / 2,
          pageY: rect.y + rect.height / 2
        };

        cy.wrap(el)
          .trigger("mousedown", { ...origin })
          .trigger("mousemove");

        cy.get("[data-cy=draggable_one_2]").then(el => {
          const rect = el[0].getBoundingClientRect();

          const origin = {
            pageX: rect.x,
            pageY: rect.y
          };

          cy.wrap(el)
            .trigger("mousemove")
            .get("[data-cy=droppable_one]")
            .and($res => {
              expect($res[0].scrollTop).to.equal(0);
              expect($res[0].scrollLeft).to.equal(0);
            })
            .get("[data-cy=droppable_one]")
            .scrollTo("bottomRight")
            .get("[data-cy=container]")
            .and($res => {
              expect($res[0].scrollTop).to.equal(0);
              expect($res[0].scrollLeft).to.equal(0);
            })
            .then(el => {
              const containerRect = el[0].getBoundingClientRect();

              cy.window()
                .trigger("mousemove", {
                  clientX: containerRect.x + containerRect.width - 10,
                  clientY: containerRect.y + containerRect.height - 10
                })
                .trigger("mousemove", {
                  clientX: containerRect.x + containerRect.width - 9,
                  clientY: containerRect.y + containerRect.height - 9
                })

                .get("[data-cy=container]")
                .and($res => {
                  expect($res[0].scrollTop).not.to.equal(0);
                  expect($res[0].scrollLeft).not.to.equal(0);
                })
                .wait(200)
                .window()
                .trigger("mousemove", {
                  clientX: rect.x - 100,
                  clientY: rect.y - 100
                })
                .get("[data-cy=droppable_one]")
                .and($res => {
                  const rect = $res[0].getBoundingClientRect();

                  expect($res[0].scrollTop).not.to.equal(rect.x + rect.height);
                });
            });
        });
      });
    });
  });

  describe("tests scroll for keyboard users", () => {
    it("scrolls horizontally in the container when component updates", () => {
      cy.get("[data-cy=draggable_one_1]")
        .trigger("keydown", { keyCode: 32 })
        .window()
        .trigger("keydown", { key: "ArrowRight" })
        .get("[data-cy^=droppable_one]")
        .and($res => {
          expect($res[0].scrollTop).to.equal(0);
          expect($res[0].scrollLeft).to.equal(0);
        })
        .window()
        .trigger("keydown", { key: "ArrowRight" })
        .get("[data-cy^=droppable_one]")
        .and($res => {
          expect($res[0].scrollTop).to.equal(0);
          expect($res[0].scrollLeft).to.equal(150);
        });
    });

    it("scrolls the next container into view if it isnt already visible", () => {
      cy.get("[data-cy=draggable_one_1]").trigger("keydown", { keyCode: 32 });
      cy.get("[data-cy=droppable_one]")
        .should("be.visible")
        .get("[data-cy=droppable_two]")
        .should("not.be.visible")
        .window()
        .trigger("keydown", {
          key: "ArrowDown"
        })
        .get("[data-cy=droppable_two]")
        .should("be.visible");
    });
  });
});
