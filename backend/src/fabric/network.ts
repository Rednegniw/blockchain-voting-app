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

export const invoke = async (networkObj: NetworkObj, isQuery: boolean, func: string, args: string[]) => {
    if (isQuery) {
      if (args) {
        console.log("ARGS:", args);
        let response = await networkObj.contract.evaluateTransaction(
          func,
          ...args
        );

        networkObj.gateway.disconnect();

        return response;
      } else {
        let response = await networkObj.contract.evaluateTransaction(func);

        networkObj.gateway.disconnect();

        return response;
      }
    } else {
      if (args) {
        let response = await networkObj.contract.submitTransaction(func, ...args);

        networkObj.gateway.disconnect();

        return response;
      }
    }
};

export const registerVoter = async (
  registrarId: string,
  name: string,
) => {
  if (!registrarId || !name) {
    return {
      error: "Error! You need to fill all fields before you can register!"
    }
  }

  try {
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

    let response = { data: `Successfully registered voter ${name}. Use voterId ${registrarId} to login above.` };
    return response;
  } catch (error) {
    return { error };
  }
};
