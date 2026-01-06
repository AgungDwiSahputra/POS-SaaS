import {digitalPurchaseTransactionActionType} from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case digitalPurchaseTransactionActionType.FETCH_DIGITAL_PURCHASE_TRANSACTIONS:
            return action.payload;
        case digitalPurchaseTransactionActionType.ADD_DIGITAL_PURCHASE_TRANSACTION:
            return [action.payload, ...state];
        case digitalPurchaseTransactionActionType.DELETE_DIGITAL_PURCHASE_TRANSACTION:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};
