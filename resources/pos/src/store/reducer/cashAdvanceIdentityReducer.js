import { cashAdvanceIdentityActionType } from "../../constants";

const initialState = {
    cashAdvanceIdentities: [],
    singleCashAdvanceIdentity: [],
    activeIdentitiesForSelect: [],
    totalRecord: 0,
    isLoading: false,
    isCallFetchDataApi: false,
};

const cashAdvanceIdentityReducer = (state = initialState, action) => {
    switch (action.type) {
        case cashAdvanceIdentityActionType.FETCH_CASH_ADVANCE_IDENTITIES:
            return {
                ...state,
                cashAdvanceIdentities: action.payload,
                totalRecord: action.totalRecord,
                isLoading: action.isLoading,
                isCallFetchDataApi: action.isCallFetchDataApi,
            };
        case cashAdvanceIdentityActionType.FETCH_CASH_ADVANCE_IDENTITY:
            return {
                ...state,
                singleCashAdvanceIdentity: action.payload,
                isLoading: action.isLoading,
            };
        case cashAdvanceIdentityActionType.ADD_CASH_ADVANCE_IDENTITY:
            return {
                ...state,
                isLoading: action.isLoading,
            };
        case cashAdvanceIdentityActionType.EDIT_CASH_ADVANCE_IDENTITY:
            return {
                ...state,
                isLoading: action.isLoading,
            };
        case cashAdvanceIdentityActionType.DELETE_CASH_ADVANCE_IDENTITY:
            return {
                ...state,
                isLoading: action.isLoading,
            };
        case cashAdvanceIdentityActionType.FETCH_ACTIVE_IDENTITIES_FOR_SELECT:
            return {
                ...state,
                activeIdentitiesForSelect: action.payload,
                isLoading: action.isLoading,
            };
        case cashAdvanceIdentityActionType.FETCH_IDENTITIES_WITH_SUMMARY:
            return {
                ...state,
                identitiesWithSummary: action.payload,
                isLoading: action.isLoading,
            };
        default:
            return state;
    }
};

export default cashAdvanceIdentityReducer;
