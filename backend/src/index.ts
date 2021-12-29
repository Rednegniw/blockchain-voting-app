import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import * as network from "./fabric/network";
import { isErrorObj } from "./types";
import { CastVoteArgs, CreateElectionArgs, CreateVoterArgs } from "../../types/methods";
import { contractRequest, invokeNetwork } from "./utils/request";

require("dotenv").config();

const app = express();
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

app.get("/queryAll", async (_, res) =>
  contractRequest({ res, isQuery: true, method: "queryAll", args: [] })
);

app.get("/getElectionWorldState", async (req, res) =>
  contractRequest({
    res,
    isQuery: true,
    method: "getElectionWorldState",
    args: [req.query.electionId as string],
  })
);

app.post("/getCurrentStanding", async (req, res) =>
  contractRequest({
    res,
    isQuery: true,
    method: "getVotablesByElectionId",
    args: [req.body.electionId],
  })
);

app.get("/getElection", async (req, res) =>
  contractRequest({
    res,
    isQuery: true,
    method: "getElectionByVoterId",
    args: [req.query.voterId as string],
  })
);

app.post("/castBallot", async (req, res) =>
  contractRequest({
    res,
    isQuery: false,
    method: "castVote",
    args: [JSON.stringify(req.body as CastVoteArgs)],
  })
);

app.post("/createElection", async (req, res) =>
  contractRequest({
    res,
    isQuery: false,
    method: "createElection",
    args: [JSON.stringify(req.body as CreateElectionArgs)],
  })
);

app.post("/queryWithQueryString", async (req, res) =>
  contractRequest({
    res,
    isQuery: true,
    method: "queryWithQueryString",
    args: [JSON.stringify(req.body.query)],
  })
);

app.post("/registerVoter", async (req, res) => {
  const { registrarId, name, electionId }: CreateVoterArgs = req.body;

  let response = await network.registerVoter(registrarId, name);

  if (isErrorObj(response)) {
    res.send(response.error);
    return;
  }

  contractRequest({
    res,
    isQuery: false,
    method: "createVoter",
    args: [JSON.stringify({ registrarId, name, electionId })],
    userName: registrarId,
  });
});

app.get("/validateVoter", async (req, res) =>
  contractRequest({
    res,
    isQuery: true,
    method: "readMyAsset",
    args: [req.query.id as string]
  })
);

app.post("/queryByKey", async (req, res) =>
  contractRequest({
    res,
    isQuery: true,
    method: "readMyAsset",
    args: [req.body.key],
  })
);

// This method is for testing purposes only.
app.get("/reinitWorldState", async (_, res) => {
  const result = await invokeNetwork({
    res,
    isQuery: false,
    method: "restartWorldState",
  })

  if (result) {
    await invokeNetwork({
      res,
      isQuery: false,
      method: "init",
    })

    res.status(200).send({ success: true })
  }
})

app.listen(process.env.PORT || 8085);
