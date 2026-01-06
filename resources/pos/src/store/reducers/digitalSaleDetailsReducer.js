import {digitalSaleActionType} from '../../constants';

export default (state = {}, action) => {
    switch (action.type) {
        case digitalSaleActionType.FETCH_DIGITAL_SALE_DETAILS:
            return action.payload;
        default:
            return state;
    }
};
