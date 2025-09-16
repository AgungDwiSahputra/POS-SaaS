import { cashAdvanceActionType } from "../../constants";

export default (state = [], action) => {
    switch (action.type) {
    case cashAdvanceActionType.FETCH_CASH_ADVANCES:
        return action.payload;
    case cashAdvanceActionType.FETCH_CASH_ADVANCE:
        return [action.payload];
    case cashAdvanceActionType.ADD_CASH_ADVANCE:
        return [...state, action.payload];
    case cashAdvanceActionType.EDIT_CASH_ADVANCE:
        return state.map((item) => (item.id === +action.payload.id ? action.payload : item));
    case cashAdvanceActionType.DELETE_CASH_ADVANCE:
        return state.filter((item) => item.id !== action.payload);
    default:
        return state;
    }
};
