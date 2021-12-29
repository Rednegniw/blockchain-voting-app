import { map } from "lodash";
import { Election } from "../../../types";
import { votableItems } from "./votableItems";

export const elections: Election[] = [
    {
        id: 'election1',
        name: 'Falešné volby 2022',
        startDate: new Date(2021, 10, 3).toISOString(),
        endDate: new Date(2022, 3, 3).toISOString(),
        type: 'election',
        votableItemIds: map(votableItems, 'id')
    }
]