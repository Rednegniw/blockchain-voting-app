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
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
const fabric_network_1 = require("fabric-network");
const path_1 = __importDefault(require("path"));
const config_json_1 = require("../../config.json");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const certificateAuthority = new fabric_ca_client_1.default(config_json_1.caName);
            // Create a new file system based wallet for managing identities.
            const walletPath = path_1.default.join(process.cwd(), 'wallet');
            const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
            console.log('Wallet: ' + JSON.stringify(wallet));
            // Check to see if we've already enrolled the admin user.
            const adminExists = yield wallet.get(config_json_1.appAdmin);
            console.log('Wallet exists:' + adminExists);
            if (adminExists) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }
            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = yield certificateAuthority.enroll({ enrollmentID: config_json_1.appAdmin, enrollmentSecret: config_json_1.appAdminSecret });
            console.log('ENROLLMENT:', enrollment);
            const identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: config_json_1.orgMSPID,
                type: 'X.509',
            };
            console.log('IDENTITY:', identity);
            wallet.put(config_json_1.appAdmin, identity);
            console.log('msg: Successfully enrolled admin user ' + config_json_1.appAdmin + ' and imported it into the wallet');
        }
        catch (error) {
            console.error(`Failed to enroll admin user ' + ${config_json_1.appAdmin} + : ${error}`);
            process.exit(1);
        }
    });
}
main();
