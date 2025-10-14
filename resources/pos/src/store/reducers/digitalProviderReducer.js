import { digitalProviderActionType } from "../action/digitalProviderAction";

const initialState = {
    digitalProviders: [],
    digitalProvider: null,
    activeProviders: [],
    totalRecord: 0,
    isLoading: false,
    isSaving: false,
};

const digitalProviderReducer = (state = initialState, action) => {
    switch (action.type) {
        case digitalProviderActionType.FETCH_DIGITAL_PROVIDERS:
            return {
                ...state,
                digitalProviders: action.payload.data,
                totalRecord: action.payload.total,
                isLoading: false,
            };
        case digitalProviderActionType.FETCH_DIGITAL_PROVIDER:
            return {
                ...state,
                digitalProvider: action.payload.data,
                isLoading: false,
            };
        case digitalProviderActionType.FETCH_ALL_DIGITAL_PROVIDERS:
            return {
                ...state,
                digitalProviders: action.payload.data,
            };
        case digitalProviderActionType.FETCH_ACTIVE_DIGITAL_PROVIDERS:
            console.log('digitalProviderReducer - FETCH_ACTIVE_DIGITAL_PROVIDERS:', action.payload);
            return {
                ...state,
                activeProviders: Array.isArray(action.payload) ? action.payload : [],
            };
        case digitalProviderActionType.ADD_DIGITAL_PROVIDER:
            return {
                ...state,
                digitalProviders: [action.payload.data, ...state.digitalProviders],
                totalRecord: state.totalRecord + 1,
                isSaving: false,
            };
        case digitalProviderActionType.EDIT_DIGITAL_PROVIDER:
            return {
                ...state,
                digitalProviders: state.digitalProviders.map(provider =>
                    provider.id === action.payload.data.id ? action.payload.data : provider
                ),
                digitalProvider: action.payload.data,
                isSaving: false,
            };
        case digitalProviderActionType.DELETE_DIGITAL_PROVIDER:
            return {
                ...state,
                digitalProviders: state.digitalProviders.filter(provider => provider.id !== action.payload),
                totalRecord: state.totalRecord - 1,
                isSaving: false,
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

export default digitalProviderReducer;