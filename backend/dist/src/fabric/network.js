"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVoter = exports.invoke = exports.connectToNetwork = void 0;
const fabric_network_1 = require("fabric-network");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_json_1 = require("../../config.json");
const util_1 = __importDefault(require("util"));
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
// connect to the connection file
const ccpPath = path_1.default.join(process.cwd(), config_json_1.connection_file);
const ccpJSON = fs_1.default.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);
const connectToNetwork = (userName) => __awaiter(void 0, void 0, void 0, function* () {
    const gateway = new fabric_network_1.Gateway();
    try {
        const walletPath = path_1.default.join(process.cwd(), "wallet");
        const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        const userExists = yield wallet.get(userName);
        if (!userExists) {
            console.log(`An identity for the user ${userName} does not exist in the wallet`);
            return {
                error: `An identity for the user ${userName} does not exist in the wallet. Register ${userName} first`,
            };
        }
        yield gateway.connect(ccp, {
            wallet,
            identity: userName,
            discovery: config_json_1.gatewayDiscovery,
        });
        const network = yield gateway.getNetwork("mychannel");
        console.log("Connected to mychannel.");
        // Get the contract we have installed on the peer
        const contract = network.getContract("blockchain-voting-app-contract");
        let networkObj = {
            contract,
            network,
            gateway,
        };
        return networkObj;
    }
    catch (error) {
        console.log(`Error processing transaction. ${error}`);
        return {
            error,
        };
    }
});
exports.connectToNetwork = connectToNetwork;
const invoke = (networkObj, isQuery, func, args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (isQuery) {
            if (args) {
                console.log("ARGS:", args);
                let response = yield networkObj.contract.evaluateTransaction(func, ...args);
                console.log(response);
                console.log(`Transaction ${func} with args ${args} has been evaluated`);
                networkObj.gateway.disconnect();
                return response;
            }
            else {
                let response = yield networkObj.contract.evaluateTransaction(func);
                console.log(response);
                console.log(`Transaction ${func} without args has been evaluated`);
                networkObj.gateway.disconnect();
                return response;
            }
        }
        else {
            console.log("notQuery");
            if (args) {
                args = JSON.parse(args[0]);
                console.log(util_1.default.inspect(args));
                args = [JSON.stringify(args)];
                console.log(util_1.default.inspect(args));
                console.log("before submit");
                console.log(util_1.default.inspect(networkObj));
                let response = yield networkObj.contract.submitTransaction(func, ...args);
                console.log("after submit");
                console.log(response);
                console.log(`Transaction ${func} with args ${args} has been submitted`);
                networkObj.gateway.disconnect();
                return response;
            }
            else {
                let response = yield networkObj.contract.submitTransaction(func);
                console.log(response);
                console.log(`Transaction ${func} with args has been submitted`);
                networkObj.gateway.disconnect();
                return response;
            }
        }
    }
    catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return {
            error: 'Failed to submit transaction.'
        };
    }
});
exports.invoke = invoke;
const registerVoter = (voterId, registrarId, name) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('ARGUMENTS', { voterId, registrarId, name });
    if (!registrarId || !voterId || !name) {
        return {
            error: "Error! You need to fill all fields before you can register!"
        };
    }
    try {
        const walletPath = path_1.default.join(process.cwd(), "wallet");
        const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        // Check to see if we've already enrolled the user.
        const userExists = yield wallet.get(voterId);
        if (userExists) {
            return {
                error: `Error! An identity for the user ${voterId} already exists in the wallet. Please enter
        a different license number.`
            };
        }
        // Check to see if we've already enrolled the admin user.
        const adminIdentity = yield wallet.get(config_json_1.appAdmin);
        if (!adminIdentity) {
            return {
                error: `An identity for the admin user ${config_json_1.appAdmin} does not exist in the wallet. Run the enrollAdmin.js application before retrying`
            };
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new fabric_network_1.Gateway();
        yield gateway.connect(ccp, {
            wallet,
            identity: config_json_1.appAdmin,
            discovery: config_json_1.gatewayDiscovery,
        });
        // Get the CA client object from the gateway for interacting with the CA.
        const ca = new fabric_ca_client_1.default(config_json_1.caName);
        console.log(`AdminIdentity: + ${adminIdentity}`);
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = yield provider.getUserContext(adminIdentity, config_json_1.appAdmin);
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = yield ca.register({ affiliation: "", enrollmentID: voterId, role: "client" }, adminUser);
        const enrollment = yield ca.enroll({
            enrollmentID: voterId,
            enrollmentSecret: secret,
        });
        const identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: config_json_1.orgMSPID,
            type: 'X.509',
        };
        yield wallet.put(voterId, identity);
        console.log(`Successfully registered voter ${name}. Use voterId ${voterId} to login above.`);
        let response = { data: `Successfully registered voter ${name}. Use voterId ${voterId} to login above.` };
        return response;
    }
    catch (error) {
        console.error(`Failed to register user + ${voterId} + : ${error}`);
        let response = {
            error
        };
        return response;
    }
});
exports.registerVoter = registerVoter;
