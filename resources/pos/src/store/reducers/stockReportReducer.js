import {stockReportActionType} from '../../constants';

const initialState = {
    data: [],
    isLoading: false,
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case stockReportActionType.STOCK_REPORT:
            return {
                ...state,
                data: action.payload || [],
                error: null
            };
        default:
            return state;
    }
};
