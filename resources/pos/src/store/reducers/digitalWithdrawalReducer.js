import { digitalWithdrawalActionType } from "../action/digitalWithdrawalAction";

const initialState = {
    digitalWithdrawals: [],
    totalRecord: 0,
    isLoading: false,
    isSaving: false,
};

const digitalWithdrawalReducer = (state = initialState, action) => {
    switch (action.type) {
        case digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWALS:
            return {
                ...state,
                digitalWithdrawals: action.payload.data,
                totalRecord: action.payload.total,
                isLoading: false,
            };
        case digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWAL:
            return {
                ...state,
                digitalWithdrawal: action.payload.data,
                isLoading: false,
            };
        case digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWALS_BY_STORE:
            return {
                ...state,
                withdrawalsByStore: action.payload.data,
            };
        case digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWALS_SUMMARY:
            return {
                ...state,
                withdrawalsSummary: action.payload.data,
            };
        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.payload,
            };
        case "SET_SAVING":
            return {
                ...state,
                isSaving: action.payload,
            };
        default:
            return state;
    }
};

export default digitalWithdrawalReducer;
