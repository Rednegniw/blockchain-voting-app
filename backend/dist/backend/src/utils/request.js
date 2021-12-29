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
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractRequest = void 0;
const network = __importStar(require("../fabric/network"));
const config_json_1 = require("../../config.json");
const types_1 = require("src/types");
const utils_1 = require("../../../utils");
const contractRequest = ({ res, isQuery, method, args, userName = config_json_1.appAdmin, reactToParsedResponse = () => { } }) => __awaiter(void 0, void 0, void 0, function* () {
    const networkObj = yield network.connectToNetwork(userName || config_json_1.appAdmin);
    if ((0, types_1.isNetworkObj)(networkObj)) {
        try {
            const response = yield network.invoke(networkObj, isQuery, method, args);
            const parsedResponse = yield (0, utils_1.decodeAndParse)(response);
            reactToParsedResponse(parsedResponse);
            res.send(parsedResponse);
        }
        catch (err) {
            res.status(500).send({ error: err });
        }
    }
    else {
        res.status(500).send(networkObj);
    }
});
exports.contractRequest = contractRequest;
