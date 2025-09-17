import { cashAdvanceReportActionType } from "../../constants";

const initialState = {
    data: [],
    summary: {},
    meta: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
    case cashAdvanceReportActionType.FETCH_CASH_ADVANCE_REPORT:
        return {
            data: action.payload?.data || [],
            summary: action.payload?.summary || {},
            meta: action.payload?.meta || {},
        };
    default:
        return state;
    }
};
