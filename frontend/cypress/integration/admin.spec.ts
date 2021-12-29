describe('admin functions', () => {
    beforeEach(() => {
        cy.request('http://localhost:8085/reinitWorldState');
    });

    it('can login into admin dashboard', () => {
        const adminCredentials = {
            email: 'admin@gmail.com',
            password: 'testingtesting',
        };

        cy.visit('/admin');

        cy.url().should('include', '/login');

        cy.get('[name="email"]').type(adminCredentials.email);
        cy.get('[name="password"]').type(adminCredentials.password);

        cy.get('[type="submit"]').click();

        cy.url().should('not.include', '/login').should('include', '/admin');
    });

    it('can register a new voter', () => {
        const newVoter = {
            name: 'New user',
            registrarId: '9876543',
            electionId: 'electionId',
        };

        cy.adminLogin();

        cy.visit('/admin');
        cy.getBySel('link-election1').click();

        cy.url().should('include', '/election1/registerUser');

        cy.get('[name="name"]').type(newVoter.name);
        cy.get('[name="registrarId"]').type(newVoter.registrarId);

        cy.get('[type="submit"]').click();

        cy.url().should('include', '/admin');
    });

    it('can add a new election', () => {
        const newElection = {
            name: 'A New Election',
            endDate: '2022-03-10T19:36:06.000Z',
            votableItems: [
                {
                    name: 'Test1',
                    description: 'Test 1 description',
                },
                {
                    name: 'Test2',
                    description: 'Test 2 description',
                },
                {
                    name: 'Test3',
                    description: 'Test 3 description',
                },
            ],
        };

        cy.adminLogin()

        cy.visit('/admin/new')
        cy.get('[name="name"]').type(newElection.name)
        cy.get('[name="endDate"]').clear().type(new Date(newElection.endDate).toDateString())

        for (const votableItem of newElection.votableItems) {
            cy.getBySel('votable-item-button').click()

            cy.getBySel('modal').find('[name="name"]').type(votableItem.name)
            cy.getBySel('modal').clear().find('[name="description"]').type(votableItem.description)

            cy.getBySel('modal').find('[type="submit"]').click();
        }

        cy.get('[type="submit"]').click()
        cy.url().should('include', '/admin');
        cy.contains(newElection.name).should('exist')
    });
});
