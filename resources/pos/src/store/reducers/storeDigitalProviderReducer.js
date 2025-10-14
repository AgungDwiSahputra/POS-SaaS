import { storeDigitalProviderActionType } from "../action/storeDigitalProviderAction";

const initialState = {
    storeDigitalProviders: [],
    totalRecord: 0,
    isLoading: false,
    isSaving: false,
};

const storeDigitalProviderReducer = (state = initialState, action) => {
    switch (action.type) {
        case storeDigitalProviderActionType.FETCH_STORE_DIGITAL_PROVIDERS:
            console.log('storeDigitalProviderReducer - FETCH_STORE_DIGITAL_PROVIDERS:', action.payload);

            // Handle different response structures
            let providersData = [];
            let totalRecord = 0;

            if (action.payload && action.payload.data) {
                providersData = Array.isArray(action.payload.data) ? action.payload.data : [];
                totalRecord = action.payload.total || providersData.length;
            } else if (Array.isArray(action.payload)) {
                providersData = action.payload;
                totalRecord = action.payload.length;
            }

            console.log('storeDigitalProviderReducer - final providers data:', providersData);
            console.log('storeDigitalProviderReducer - total record:', totalRecord);

            return {
                ...state,
                storeDigitalProviders: providersData,
                totalRecord: totalRecord,
                isLoading: false,
            };
        case storeDigitalProviderActionType.FETCH_PROVIDERS_BY_STORE:
            return {
                ...state,
                providersByStore: action.payload.data,
            };
        case storeDigitalProviderActionType.ADD_BALANCE:
            return {
                ...state,
                balanceUpdate: action.payload.data,
            };
        case storeDigitalProviderActionType.GET_BALANCE:
            return {
                ...state,
                currentBalance: action.payload.data,
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

export default storeDigitalProviderReducer;