import {stockReportActionType} from '../../constants';

const initialState = {
    data: [],
    grandTotalAsset: 0,
    filteredTotalAsset: 0,
    isLoading: false,
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case stockReportActionType.STOCK_REPORT:
            return {
                ...state,
                data: action.payload?.data || action.payload || [],
                grandTotalAsset: action.payload?.grandTotalAsset || 0,
                filteredTotalAsset: action.payload?.filteredTotalAsset || 0,
                error: null
            };
        default:
            return state;
    }
};
