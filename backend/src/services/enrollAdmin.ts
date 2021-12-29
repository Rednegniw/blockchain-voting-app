import FabricCAServices from 'fabric-ca-client';
import { Wallets, X509Identity } from 'fabric-network';
import path from 'path';
import { appAdmin, appAdminSecret, orgMSPID, caName } from '../../config.json'

async function main() {
  try {
    const certificateAuthority = new FabricCAServices(caName);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled the admin user.
    const adminExists = await wallet.get(appAdmin);

    if (adminExists) {
      console.error('An identity for the admin user "admin" already exists in the wallet');
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await certificateAuthority.enroll({ enrollmentID: appAdmin, enrollmentSecret: appAdminSecret });

    const identity: X509Identity = {
      credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSPID,
      type: 'X.509',
    }

    wallet.put(appAdmin, identity);
  } catch (error) {
    console.error(`Failed to enroll admin user ' + ${appAdmin} + : ${error}`);
    process.exit(1);
  }
}

main();
