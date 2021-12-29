declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
      */
       getBySel(dataTestAttribute: string, args?: any): Chainable<Element>;
       getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<Element>;
       logoutUser(): Chainable<Element>;
       selectFirstDropdownItem(selector: string): Chainable<Element>
       loginWithId(id: string): void
       adminLogin(): Chainable
       reinitWorldState(): Chainable<Response<any>>
    }
}