import { digitalProductActionType } from "../action/digitalProductAction";

const initialState = {
    digitalProducts: [],
    totalRecord: 0,
    isLoading: false,
    isSaving: false,
};

const digitalProductReducer = (state = initialState, action) => {
    switch (action.type) {
        case digitalProductActionType.FETCH_DIGITAL_PRODUCTS:
            console.log('digitalProductReducer - FETCH_DIGITAL_PRODUCTS:', action.payload);

            // Handle different response structures
            let productsData = [];
            let totalRecord = 0;

            if (action.payload && action.payload.data) {
                productsData = Array.isArray(action.payload.data) ? action.payload.data : [];
                totalRecord = action.payload.total || productsData.length;
            } else if (Array.isArray(action.payload)) {
                productsData = action.payload;
                totalRecord = action.payload.length;
            }

            console.log('digitalProductReducer - final products data:', productsData);
            console.log('digitalProductReducer - total record:', totalRecord);

            return {
                ...state,
                digitalProducts: productsData,
                totalRecord: totalRecord,
                isLoading: false,
            };
        case digitalProductActionType.FETCH_DIGITAL_PRODUCT:
            console.log('digitalProductReducer - FETCH_DIGITAL_PRODUCT:', action.payload);
            console.log('digitalProductReducer - action.payload.data:', action.payload.data);
            console.log('digitalProductReducer - action.payload type:', typeof action.payload);

            // Handle different response structures
            let productData = null;
            if (action.payload && action.payload.data) {
                productData = action.payload.data;
            } else if (action.payload && (action.payload.id || action.payload.name)) {
                // If payload is the product data itself
                productData = action.payload;
            }

            console.log('digitalProductReducer - final productData:', productData);

            return {
                ...state,
                digitalProduct: productData,
                isLoading: false,
            };
        case digitalProductActionType.CLEAR_DIGITAL_PRODUCT:
            console.log('digitalProductReducer - CLEAR_DIGITAL_PRODUCT');
            return {
                ...state,
                digitalProduct: null,
                isLoading: false,
            };
        case digitalProductActionType.CLEAR_DIGITAL_PRODUCT:
            console.log('digitalProductReducer - CLEAR_DIGITAL_PRODUCT');
            return {
                ...state,
                digitalProduct: null,
                isLoading: false,
            };
        case digitalProductActionType.FETCH_ALL_DIGITAL_PRODUCTS:
            return {
                ...state,
                allProducts: action.payload.data || [],
            };
        case digitalProductActionType.FETCH_ACTIVE_DIGITAL_PRODUCTS:
            return {
                ...state,
                activeProducts: action.payload.data || [],
            };
        case digitalProductActionType.FETCH_DIGITAL_PRODUCTS_BY_CATEGORY:
            return {
                ...state,
                productsByCategory: action.payload.data || [],
            };
        case digitalProductActionType.ADD_DIGITAL_PRODUCT:
            return {
                ...state,
                digitalProducts: [action.payload.data, ...state.digitalProducts],
                totalRecord: state.totalRecord + 1,
                isSaving: false,
            };
        case digitalProductActionType.EDIT_DIGITAL_PRODUCT:
            return {
                ...state,
                digitalProducts: state.digitalProducts.map((product) =>
                    product.id === action.payload.data.id ? action.payload.data : product
                ),
                digitalProduct: action.payload.data || null,
                isSaving: false,
            };
        case digitalProductActionType.DELETE_DIGITAL_PRODUCT:
            return {
                ...state,
                digitalProducts: state.digitalProducts.filter(
                    (product) => product.id !== action.payload
                ),
                totalRecord: state.totalRecord > 0 ? state.totalRecord - 1 : 0,
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

export default digitalProductReducer;
