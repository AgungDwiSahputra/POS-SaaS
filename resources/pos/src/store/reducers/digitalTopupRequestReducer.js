import { digitalTopupRequestActionType } from "../action/digitalTopupRequestAction";

const initialState = {
    digitalTopupRequests: [],
    totalRecord: 0,
    isLoading: false,
    isSaving: false,
    pendingCount: 0,
    pendingRequests: [],
};

const digitalTopupRequestReducer = (state = initialState, action) => {
    switch (action.type) {
        case digitalTopupRequestActionType.FETCH_DIGITAL_TOPUP_REQUESTS: {
            const requests = Array.isArray(action.payload?.data)
                ? action.payload.data
                : Array.isArray(action.payload)
                    ? action.payload
                    : [];

            const total = action.payload?.total ?? requests.length;
            const pendingCount = action.payload?.pending_count;

            return {
                ...state,
                digitalTopupRequests: requests,
                totalRecord: total,
                pendingCount: pendingCount !== undefined ? pendingCount : state.pendingCount,
                isLoading: false,
            };
        }
        case digitalTopupRequestActionType.FETCH_DIGITAL_TOPUP_REQUEST:
            return {
                ...state,
                digitalTopupRequest: action.payload.data,
                isLoading: false,
            };
        case digitalTopupRequestActionType.FETCH_PENDING_DIGITAL_TOPUP_REQUESTS:
            return {
                ...state,
                pendingRequests: action.payload?.data || [],
                pendingCount: action.payload?.total ?? state.pendingCount,
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

export default digitalTopupRequestReducer;
