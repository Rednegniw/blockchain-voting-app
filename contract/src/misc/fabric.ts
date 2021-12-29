import { Context } from "fabric-contract-api";
import { objectToByteArray } from "../../../utils";

export const addToState = (ctx: Context, id: string, object: object) => {
    try {
        return ctx.stub.putState(
            id,
            objectToByteArray(object)
        );
    } catch (err) {
        throw 'Asset could not be added to state: ' + err
    }
}