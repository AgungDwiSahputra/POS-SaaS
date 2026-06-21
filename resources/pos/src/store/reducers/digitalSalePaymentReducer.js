import {digitalSaleActionType} from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case digitalSaleActionType.FETCH_DIGITAL_SALE_PAYMENT:
            return action.payload;
        case digitalSaleActionType.EDIT_DIGITAL_SALE_PAYMENT:
            return state.map(item => item.id === action.payload.id ? action.payload : item);
        case digitalSaleActionType.DELETE_DIGITAL_SALE_PAYMENT:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};
