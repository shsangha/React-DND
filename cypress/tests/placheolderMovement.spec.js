const PLACEHOLDER_ID = "react_dnd_placeholder_element_id";

describe("placholder moves properly with mousemovement on window", () => {
  it("works", () => {
    cy.visit("/placeholderMovement");

    cy.get("[data-cy=dragel]").then(el => {
      const rect = el[0].getBoundingClientRect();

      cy.get(`#${PLACEHOLDER_ID}`).should("not.exist");

      const origin = {
        pageX: rect.x + rect.width / 2,
        pageY: rect.y + rect.height / 2
      };

      cy.get("[data-cy=dragel]").trigger("mousedown", {
        ...origin
      });

      cy.get(`#${PLACEHOLDER_ID}`).should("exist");

      cy.window()
        .trigger("mousemove", { clientX: 100, clientY: 100 })
        .then(() => {
          cy.get(`#${PLACEHOLDER_ID}`).then(el => {
            const rect = el[0].getBoundingClientRect();

            const newOriginPos = {
              pageX: rect.x + rect.width / 2,
              pageY: rect.y + rect.height / 2
            };

            expect(newOriginPos.pageX).to.equal(100);
            expect(newOriginPos.pageY).to.equal(100);

            cy.window()
              .trigger("mousemove", { clientX: 10, clientY: 40 })
              .then(() => {
                cy.get(`#${PLACEHOLDER_ID}`).then(el => {
                  const rect = el[0].getBoundingClientRect();

                  const newOriginPos = {
                    pageX: rect.x + rect.width / 2,
                    pageY: rect.y + rect.height / 2
                  };

                  expect(newOriginPos.pageX).to.equal(10);
                  expect(newOriginPos.pageY).to.equal(40);

                  cy.window()
                    .trigger("mouseup")
                    .then(() => {
                      cy.get(`#${PLACEHOLDER_ID}`).should("not.exist");
                    });
                });
              });
          });
        });
    });
  });
});

describe("placeholder test for touch movement", () => {
  it("works as expected", () => {
    cy.visit("/placeholderMovement");

    cy.get("[data-cy=dragel]").then(el => {
      const rect = el[0].getBoundingClientRect();
      cy.get(`#${PLACEHOLDER_ID}`).should("not.exist");

      const origin = {
        pageX: rect.x + rect.width / 2,
        pageY: rect.y + rect.height / 2
      };

      cy.get("[data-cy=dragel]").then(el => {
        const event = new TouchEvent("touchstart", {
          bubbles: true
        });

        Object.defineProperty(event, "touches", {
          value: [{ ...origin }],
          writable: false
        });

        el[0].dispatchEvent(event);

        cy.get(`#${PLACEHOLDER_ID}`).should("exist");

        const mockEvent = Object.defineProperty(
          new TouchEvent("touchmove"),
          "touches",
          {
            value: [{ clientX: 100, clientY: 100 }],
            writable: false
          }
        );

        event.target.dispatchEvent(mockEvent);

        cy.get(`#${PLACEHOLDER_ID}`).then(element => {
          const rect = element[0].getBoundingClientRect();

          expect(rect.x + rect.width / 2).to.equal(100);
          expect(rect.y + rect.height / 2).to.equal(100);

          cy.window().trigger("touchend");
          cy.get(`#${PLACEHOLDER_ID}`).should("not.exist");
        });
      });
    });
  });
});
