import { cashAdvanceActionType } from "../../constants";

const initialState = {
    paid_off: 0,
    pending: 0,
};

export default (state = initialState, action) => {
    switch (action.type) {
    case cashAdvanceActionType.SET_CASH_ADVANCE_SUMMARY:
        return {
            paid_off: action.payload?.paid_off ?? 0,
            pending: action.payload?.pending ?? 0,
        };
    default:
        return state;
    }
};
