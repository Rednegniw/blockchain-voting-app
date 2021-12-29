"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorObj = exports.isNetworkObj = void 0;
const isNetworkObj = (networkObj) => {
    return 'contract' in networkObj;
};
exports.isNetworkObj = isNetworkObj;
const isErrorObj = (errorObj) => {
    return 'error' in errorObj;
};
exports.isErrorObj = isErrorObj;
