import { balanceRequestActionType } from '../../constants';

const initialState = {
    balanceRequests: [],
    pendingCount: 0,
    singleBalanceRequest: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case balanceRequestActionType.FETCH_BALANCE_REQUESTS:
            return {
                ...state,
                balanceRequests: [...action.payload],
            };
        case balanceRequestActionType.FETCH_BALANCE_REQUEST:
            return {
                ...state,
                singleBalanceRequest: action.payload,
            };
        case balanceRequestActionType.ADD_BALANCE_REQUEST:
            return {
                ...state,
                balanceRequests: action.payload,
            };
        case balanceRequestActionType.UPDATE_BALANCE_REQUEST_STATUS:
            return {
                ...state,
                balanceRequests: state.balanceRequests.map(item => {
                    const itemId = item.id || (item.attributes && item.attributes.id);
                    const payloadId = action.payload.id || (action.payload.attributes && action.payload.attributes.id);
                    return itemId === payloadId ? action.payload : item;
                }),
                singleBalanceRequest: state.singleBalanceRequest
                    ? (state.singleBalanceRequest.id === action.payload.id ? action.payload : state.singleBalanceRequest)
                    : null,
            };
        case balanceRequestActionType.DELETE_BALANCE_REQUEST:
            return {
                ...state,
                balanceRequests: state.balanceRequests.filter(item => {
                    const itemId = item.id || (item.attributes && item.attributes.id);
                    return itemId !== action.payload;
                }),
            };
        case balanceRequestActionType.FETCH_BALANCE_REQUEST_PENDING_COUNT:
            return {
                ...state,
                pendingCount: action.payload,
            };
        default:
            return state;
    }
};
