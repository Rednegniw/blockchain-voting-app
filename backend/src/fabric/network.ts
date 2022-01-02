import FabricCAServices from "fabric-ca-client";
import { Gateway, Wallets, X509Identity } from "fabric-network";
import fs from "fs";
import path from "path";
import { NetworkObj } from "src/types";
import {
  appAdmin, caName, connection_file,
  gatewayDiscovery, orgMSPID
} from "../../config.json";

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);

/**
 * An abstracted connection to connect to the network and return the
 * fabric network object.
 *
 * @param {string} userName - with what wallet are we signing in? The default is admin.
 * @return {NetworkObj | ErrorResponse} - Either a network object or an error response.
 */
export const connectToNetwork = async (userName: string) => {
  const gateway = new Gateway();

  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const userExists = await wallet.get(userName);

    if (!userExists) {
      return {
        error: `An identity for the user ${userName} does not exist in the wallet.`,
      };
    }

    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });

    // Get the network and the contract
    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("blockchain-voting-app-contract");

    let networkObj: NetworkObj = {
      contract,
      network,
      gateway,
    };

    return networkObj;
  } catch (error: unknown) {
    return { error };
  }
};

/**
 * A function to invoke a contract request. It differentiates whether the transaction is
 * a query or a mutation.
 *
 * @param {NetworkObj} networkObj - the fabric network object.
 * @param {boolean} isQuery - whether it is a query or not.
 * @param {string} transactionName - the name of the transaction
 * @param {string[]} args - args in a string array format.
 * @return {*} 
 */
export const invoke = async (networkObj: NetworkObj, isQuery: boolean, transactionName: string, args: string[]) => {
    if (isQuery) {
      // We evaluate the transaction and get a response if successful
      if (args) {
        let response = await networkObj.contract.evaluateTransaction(
          transactionName,
          ...args
        );

        networkObj.gateway.disconnect();

        return response;
      } else {
        let response = await networkObj.contract.evaluateTransaction(transactionName);

        networkObj.gateway.disconnect();

        return response;
      }
    } else {
      if (args) {
        let response = await networkObj.contract.submitTransaction(transactionName, ...args);

        networkObj.gateway.disconnect();

        return response;
      }
    }
};
/**
 * A function to register a new woter, which creates a user wallet in the backend file system.
 * It registers the new wallet with the Hyperledger Fabric certificate authority.
 *
 * @param {string} registrarId - the unique Id of the user (such as an ID number)
 * @param {string} name - the name of the user.
 * @return {*} - returns either a success response or an error.
 */
export const registerVoter = async (
  registrarId: string,
  name: string,
) => {
  // Some validation
  if (!registrarId || !name) {
    return {
      error: "Error! You need to fill all fields before you can register!"
    }
  }

  try {
    // Creating a new wallet in the filesystem
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.get(registrarId);
    if (userExists) {
      return {
        error: `Error! An identity for the user ${registrarId} already exists in the wallet.`
      };
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get(appAdmin);
    if (!adminIdentity) {
      return {
        error: `An identity for the admin user ${appAdmin} does not exist in the wallet. Run the enrollAdmin.js application before retrying`
      };
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: appAdmin,
      discovery: gatewayDiscovery,
    });

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = new FabricCAServices(caName)

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, appAdmin);

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register(
      { affiliation: "", enrollmentID: registrarId, role: "client" },
      adminUser
    );

    const enrollment = await ca.enroll({
      enrollmentID: registrarId,
      enrollmentSecret: secret,
    });
    
    const identity: X509Identity = {
      credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSPID,
      type: 'X.509',
  };
   
    await wallet.put(registrarId, identity);

    // Send a response if successful
    let response = { data: `Successfully registered voter ${name}. Use voterId ${registrarId} to login above.` };
    return response;
  } catch (error) {
    return { error };
  }
};
