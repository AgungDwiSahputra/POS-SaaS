import { digitalSaleActionType } from "../action/digitalSaleAction";

const initialState = {
    digitalSales: [],
    totalRecord: 0,
    isLoading: false,
    isSaving: false,
};

const getSaleId = (sale) => {
    if (!sale) {
        return null;
    }

    if (sale.id !== undefined && sale.id !== null) {
        return sale.id;
    }

    if (sale.attributes && sale.attributes.id !== undefined) {
        return sale.attributes.id;
    }

    return null;
};

const digitalSaleReducer = (state = initialState, action) => {
    switch (action.type) {
        case digitalSaleActionType.FETCH_DIGITAL_SALES: {
            const digitalSales = action.payload?.data || [];
            const totalRecord =
                action.payload?.total !== undefined
                    ? action.payload.total
                    : digitalSales.length;

            return {
                ...state,
                digitalSales,
                totalRecord,
                isLoading: false,
            };
        }
        case digitalSaleActionType.FETCH_DIGITAL_SALE:
            return {
                ...state,
                digitalSale: action.payload.data,
                isLoading: false,
            };
        case digitalSaleActionType.ADD_DIGITAL_SALE:
            return {
                ...state,
                digitalSales: [action.payload.data, ...(state.digitalSales || [])],
                totalRecord: (state.totalRecord || 0) + 1,
                isSaving: false,
            };
        case digitalSaleActionType.EDIT_DIGITAL_SALE: {
            const updatedSale = action.payload.data;
            const updatedSaleId = getSaleId(updatedSale);

            return {
                ...state,
                digitalSales: (state.digitalSales || []).map((sale) =>
                    getSaleId(sale) === updatedSaleId ? updatedSale : sale
                ),
                digitalSale: updatedSale,
                isSaving: false,
            };
        }
        case digitalSaleActionType.DELETE_DIGITAL_SALE:
            return {
                ...state,
                digitalSales: (state.digitalSales || []).filter(
                    (sale) => String(getSaleId(sale)) !== String(action.payload)
                ),
                totalRecord: Math.max((state.totalRecord || 0) - 1, 0),
                isSaving: false,
            };
        case digitalSaleActionType.FETCH_DIGITAL_SALES_BY_STORE:
            return {
                ...state,
                salesByStore: action.payload.data,
            };
        case digitalSaleActionType.FETCH_DIGITAL_SALES_SUMMARY:
            return {
                ...state,
                salesSummary: action.payload.data,
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

export default digitalSaleReducer;
