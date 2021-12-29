import * as network from "../fabric/network";
import { appAdmin } from "../../config.json";
import { isNetworkObj } from "src/types";
import { decodeAndParse } from "../../../utils";
import { Response } from "express";

interface ContractRequestProps {
  res: Response;
  isQuery: boolean;
  method: string;
  args?: string[];
  userName?: string;
}

/**
 * An abstracted function to reuse as a request to the connected smart contract.
 *
 * @param {ContractRequestProps} {
 *   res, - Express Response Object
 *   isQuery, - if it is a query or a mutation
 *   method, - the name of the method
 *   args = [], - arguments for the transaction as an array of strings
 *   userName = appAdmin, - the name whose private key we use to sign the transaction
 * }
 * @return {void} - we simply submit the Express Response Object
 */
export const contractRequest = async ({
  res,
  isQuery,
  method,
  args = [],
  userName = appAdmin,
}: ContractRequestProps) => {
  const networkObj = await network.connectToNetwork(userName || appAdmin);

  if (isNetworkObj(networkObj)) {
    try {
      const response = await network.invoke(networkObj, isQuery, method, args);
      const parsedResponse: any[] = await decodeAndParse(response as Buffer);

      res.send(parsedResponse);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  } else {
    res.status(500).send(networkObj);
  }
};

export const invokeNetwork = async ({
  res,
  isQuery,
  method,
  args = [],
  userName = appAdmin,
}: ContractRequestProps) => {
  const networkObj = await network.connectToNetwork(userName || appAdmin);

  if (isNetworkObj(networkObj)) {
    try {
      const response = await network.invoke(networkObj, isQuery, method, args);

      return response;
    } catch (err) {
      res.status(500).send({ error: err });
    }
  } else {
    res.status(500).send(networkObj);
  }
};
