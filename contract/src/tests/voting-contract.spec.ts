import * as assert from 'assert';
import * as fabricNetwork from 'fabric-network';
import * as os from 'os';
import * as path from 'path';
import { decodeAndParse } from '../../../utils';
import { VotableItem, Voter } from '../../../types';
import { CastVoteArgs, CreateElectionArgs, CreateVoterArgs, GetElectionResponse } from '../../../types/methods';
import { SmartContractUtil } from './ts-smart-contract-util';

describe('My Voting Contract testing' , () => {
    const homedir: string = os.homedir();
    const walletPath: string = path.join(homedir, '.fabric-vscode', 'v2', 'environments', '1 Org Local Fabric', 'wallets', 'Org1');
    const gateway: fabricNetwork.Gateway = new fabricNetwork.Gateway();
    let fabricWallet: fabricNetwork.Wallet;
    const identityName: string = 'Org1 Admin';
    let connectionProfile: any;

    beforeAll(async () => {
        connectionProfile = await SmartContractUtil.getConnectionProfile();
        fabricWallet = await fabricNetwork.Wallets.newFileSystemWallet(walletPath);
    });

    beforeEach(async () => {
        const discoveryAsLocalhost: boolean = SmartContractUtil.hasLocalhostURLs(connectionProfile);
        const discoveryEnabled: boolean = true;

        const options: fabricNetwork.GatewayOptions = {
            discovery: {
                asLocalhost: discoveryAsLocalhost,
                enabled: discoveryEnabled,
            },
            identity: identityName,
            wallet: fabricWallet,
        };

        await gateway.connect(connectionProfile, options);
    });

    afterEach(async () => {
        gateway.disconnect();
    });

    describe('#init', () => {
        it('should submit init transaction', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'init', [], gateway);
            const parsedResponse: Voter[] = decodeAndParse(response);
            
            expect(parsedResponse.length).toBe(2)
            parsedResponse.forEach(element => expect(element.type).toBe('voter'))
        });
    });

    describe('#createVoter', () => {
        beforeEach(async () => {
            await SmartContractUtil.submitTransaction('VoterContract', 'restartWorldState', [], gateway);
            await SmartContractUtil.submitTransaction('VoterContract', 'init', [], gateway);
        })

        it('should add voter', async () => {
            const voter: CreateVoterArgs = {
                name: 'Fake Voter',
                registrarId: '52525252',
                electionId: 'election1'
            }

            const args: string[] = [JSON.stringify(voter)];

            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'createVoter', args, gateway);
            const parsedResponse: { success: string } | { error: string } = decodeAndParse(response);
            
            expect(parsedResponse).toHaveProperty('success')
        })

        it('should not add voter when it exists already', async () => {
            const voter: CreateVoterArgs = {
                name: 'Another Fake Voter',
                registrarId: '52525252',
                electionId: 'election1'
            }

            const args: string[] = [JSON.stringify(voter)];
            await SmartContractUtil.submitTransaction('VoterContract', 'createVoter', args, gateway);

            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'createVoter', args, gateway);
            const parsedResponse: { success: string } | { error: string } = decodeAndParse(response);
            
            expect(parsedResponse).toHaveProperty('error', "Voter already exists under the same registrar id.")
        })

        it('should not add voter if election does not exist', async () => {
            const voter: CreateVoterArgs = {
                name: 'Another Fake Voter',
                registrarId: '52525252afasfa',
                electionId: 'election5'
            }

            const args: string[] = [JSON.stringify(voter)];

            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'createVoter', args, gateway);
            const parsedResponse: { success: string } | { error: string } = decodeAndParse(response);
            
            expect(parsedResponse).toHaveProperty('error', "The election you specified does not exist.")
        })
    });

    describe('#readMyAsset', () => {
        it('should return asset when it exists', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'readMyAsset', ['candidate1'], gateway);
            const parsedResponse: VotableItem = decodeAndParse(response);
     
            expect(parsedResponse.type).toBe('votableItem')
            expect(parsedResponse.id).toBe('candidate1')
        })

        it('should return error when no asset exists', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'readMyAsset', ['someNonsenseAsset12345'], gateway);
            const parsedResponse: VotableItem | { error: string } = decodeAndParse(response);
     
            expect(parsedResponse).toHaveProperty('error')
        })
    });

    describe('#getElectionByVoterId', () => {
        it('should return an election if it has voter', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'getElectionByVoterId', ['voter1'], gateway);
            const parsedResponse: GetElectionResponse = decodeAndParse(response);
     
            expect(parsedResponse.type).toBe('election')
            expect(parsedResponse.votableItems).toHaveLength(3)
            parsedResponse.votableItems.forEach(element => {
                expect(element).toHaveProperty('type', 'votableItem')
            })
        })

        it('should return an error if election doesnt exist', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'getElectionByVoterId', ['voterNonsense'], gateway);
            const parsedResponse: GetElectionResponse | { error: string } = decodeAndParse(response);
     
            expect(parsedResponse).toHaveProperty('error', 'This voter does not have any ballots.' )
        })
    });

    describe('#myAssetExists', () => {
        it('should return true if asset exists', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'myAssetExists', ['candidate1'], gateway);
            const parsedResponse: boolean = decodeAndParse(response);
        
            assert.strictEqual(parsedResponse, true);
        })

        it('should return false when asset doesn\'t exist', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'myAssetExists', ['somenonsenseasset'], gateway);
            const parsedResponse: boolean = decodeAndParse(response);
        
            assert.strictEqual(parsedResponse, false);
        })
    })

    describe('#createElection', () => {
        let election: CreateElectionArgs = {
            name: 'New Election',
            startDate: new Date().toISOString(),
            endDate: new Date(2022, 10, 10).toISOString(),
            votableItems: [
                {
                    name: 'Mluvící strom',
                    description: 'Mluví a hýbe se fakt pomalu'
                },
                {
                    name: 'Zoubková víla',
                    description: 'Sladkosti pro každého!'
                }
            ]
        }

        beforeEach(async () => {
            await SmartContractUtil.submitTransaction('VoterContract', 'restartWorldState', [], gateway);
            await SmartContractUtil.submitTransaction('VoterContract', 'init', [], gateway);
        })

        it('successfully creates an election', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'createElection', [JSON.stringify(election)], gateway);
            const parsedResponse: { success: string } | { error: string } = decodeAndParse(response);  

            expect(parsedResponse).toHaveProperty('success')
        })

        it('doesnt create an election when the date is in the past', async () => {
            const electionData = { ...election, startDate: new Date(2020, 1, 1)}
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'createElection', [JSON.stringify(electionData)], gateway);
            const parsedResponse: { success: string } | { error: string } = decodeAndParse(response);  

            expect(parsedResponse).toHaveProperty('error', "An election cannot start in the past and start date must be before end date.")
        })

        it('doesnt create an election when votable items are wrong', async () => {
            const electionData = { ...election, votableItems: [{ error: 'Some error'}] }
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'createElection', [JSON.stringify(electionData)], gateway);
            const parsedResponse: { success: string } | { error: string } = decodeAndParse(response);  

            expect(parsedResponse).toHaveProperty('error', "There is an error with the format of one of the votable items.")
        })
    })
    
    describe('#castVote', () => {
        let castVoteProps: CastVoteArgs = {
            electionId: 'election1',
            voterId: 'voter1',
            picked: 'candidate1'
        }

        beforeEach(async () => {
            // Since undoing votes is almost given the nature of the ledger, I reset the world state
            await SmartContractUtil.submitTransaction('VoterContract', 'restartWorldState', [], gateway);
            await SmartContractUtil.submitTransaction('VoterContract', 'init', [], gateway);
        })

        it('should cast a vote', async () => {
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'castVote', [JSON.stringify(castVoteProps)], gateway);
            const parsedResponse: Voter | { error: string } = decodeAndParse(response);            
    
            expect(parsedResponse).toHaveProperty('type', 'voter')
        })

        it('should return an error if election does not exist', async () => {
            const props = { ...castVoteProps, electionId: 'nonsenseElectionId' }
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'castVote', [JSON.stringify(props)], gateway);
            const parsedResponse: Voter | { error: string } = decodeAndParse(response);            
    
            expect(parsedResponse).toHaveProperty('error', 'This election does not exist.')
        })

        it('should return an error if voter has cast ballot already', async () => {
            // Cast the vote
            await SmartContractUtil.submitTransaction('VoterContract', 'castVote', [JSON.stringify(castVoteProps)], gateway);

            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'castVote', [JSON.stringify(castVoteProps)], gateway);
            const parsedResponse: Voter | { error: string } = decodeAndParse(response);            
    
            expect(parsedResponse).toHaveProperty('error', 'This voter has voted already.')
        })

        it('should return an error if candidate does not exist', async () => {
            const props = { ...castVoteProps, picked: 'nonsense' }
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'castVote', [JSON.stringify(props)], gateway);
            const parsedResponse: Voter | { error: string } = decodeAndParse(response);            
    
            expect(parsedResponse).toHaveProperty('error', 'This candidate does not exist in the election you specified.')
        })
    });

    describe('#queryAll', () => {
        it('should submit queryAll transaction', async () => {
            // TODO: Update with parameters of transaction
            const response: Buffer = await SmartContractUtil.submitTransaction('VoterContract', 'queryAll', [], gateway);
            const parsedResponse: object[] = decodeAndParse(response);
     
            parsedResponse.forEach(element => expect(element).toHaveProperty('type'))
        })
    });
});
