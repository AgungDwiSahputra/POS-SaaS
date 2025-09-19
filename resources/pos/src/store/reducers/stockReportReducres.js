import {stockReportActionType} from '../../constants';

const initialState = {
    data: [],
    total_asset: 0,
    total_products: 0,
    total_quantity: 0
};

export default (state = initialState, action) => {
    switch (action.type) {
        case stockReportActionType.STOCK_REPORT:
            return {
                data: action.payload.data || action.payload,
                total_asset: action.payload.total_asset || 0,
                total_products: action.payload.total_products || 0,
                total_quantity: action.payload.total_quantity || 0
            };
        default:
            return state;
    }
};
