"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const util_1 = __importDefault(require("util"));
const network = __importStar(require("./fabric/network"));
const types_1 = require("./types");
const request_1 = require("./utils/request");
require('dotenv').config();
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('combined'));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.get('/queryAll', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, request_1.contractRequest)({ res, isQuery: true, method: 'queryAll', args: [] }); }));
app.get('/getCurrentStanding', (_, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, request_1.contractRequest)(res, true, 'queryByObjectType', ['votableItem']); }));
//vote for some candidates. This will increase the vote count for the votable objects
app.post('/castBallot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const networkObj = yield network.connectToNetwork(body.voterId);
    if ((0, types_1.isNetworkObj)(networkObj)) {
        const args = [JSON.stringify(body)];
        const response = yield network.invoke(networkObj, false, 'castVote', args);
        res.send(response);
    }
    else {
        res.status(500).send(networkObj);
    }
}));
app.post('/queryWithQueryString', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, request_1.contractRequest)(res, true, 'queryWithQueryString', [JSON.stringify(req.body.query)]); }));
//get voter info, create voter object, and update state with their voterId
app.post('/registerVoter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let voterId = req.body.voterId;
    let response = yield network.registerVoter(voterId, req.body.registrarId, req.body.name);
    if ((0, types_1.isErrorObj)(response)) {
        res.send(response.error);
        return;
    }
    let networkObj = yield network.connectToNetwork(voterId);
    if ((0, types_1.isErrorObj)(networkObj)) {
        res.status(500).send(networkObj.error);
        return;
    }
    req.body = JSON.stringify(req.body);
    let args = [req.body];
    //connect to network and update the state with voterId  
    let invokeResponse = yield network.invoke(networkObj, false, 'createVoter', args);
    if ((0, types_1.isErrorObj)(invokeResponse)) {
        res.status(500).send(invokeResponse.error);
        return;
    }
    else {
        console.log('INVOKE RESPONSE', invokeResponse.toString());
        let parsedResponse = JSON.parse(invokeResponse.toString());
        parsedResponse += '. Use voterId to login above.';
        res.send(parsedResponse);
    }
}));
//used as a way to login the voter to the app and make sure they haven't voted before 
app.post('/validateVoter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('req.body: ');
    console.log(req.body);
    let networkObj = yield network.connectToNetwork(req.body.id);
    console.log('networkobj: ');
    console.log(util_1.default.inspect(networkObj));
    if ((0, types_1.isErrorObj)(networkObj)) {
        res.status(500).send(networkObj);
        return;
    }
    let invokeResponse = yield network.invoke(networkObj, true, 'readMyAsset', [req.body.id]);
    if ((0, types_1.isErrorObj)(invokeResponse)) {
        console.log('INVOKE RESPONSE:', invokeResponse);
        res.send(invokeResponse);
        return;
    }
    let parsedResponse = yield JSON.parse(invokeResponse.toString('utf8'));
    console.log('PARSED RESPONSE', parsedResponse);
    if (parsedResponse.hasCastBallot) {
        res.status(500).send({
            error: 'This voter has already cast a ballot.'
        });
        return;
    }
    res.send(parsedResponse);
}));
app.post('/queryByKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, request_1.contractRequest)(res, true, 'readMyAsset', [req.body.key]); }));
app.listen(process.env.PORT || 8085);
