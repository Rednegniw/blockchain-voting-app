
describe('voting for a candidate', () => {
    beforeEach(() => {
        cy.request('http://localhost:8085/reinitWorldState')
    })
    it('can login with a valid user id', () => {
        const voterId = 'voter1'

        cy.visit('/')
        cy.get('input').type(voterId)
        cy.getBySel('submit').click()

        cy.url().should('include', `/election/${voterId}`)
    })

    it('does not login with an invalidUserId', () => {
        const voterId = 'blablabla'

        cy.visit('/')
        cy.get('input').type(voterId)
        cy.getBySel('submit').click()

        cy.url().should('not.include', `/election/${voterId}`)
    })

    it('can vote for a candidate', () => {
        const voterId = 'voter1'
        cy.loginWithId(voterId)
        cy.visit(`/election/${voterId}`)

        cy.url().should('include', `/election/${voterId}`)

        cy.getBySel('candidate1').click()

        cy.getBySel('submit').click()

        cy.url().should('include', `/election/${voterId}/postvote`)
        cy.getBySel('postvote-header').should('exist')
    })
})