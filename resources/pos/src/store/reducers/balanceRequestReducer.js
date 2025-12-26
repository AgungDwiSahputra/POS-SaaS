import { balanceRequestActionType } from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case balanceRequestActionType.FETCH_BALANCE_REQUESTS:
            return [...action.payload];
        case balanceRequestActionType.FETCH_BALANCE_REQUEST:
            return [action.payload];
        case balanceRequestActionType.ADD_BALANCE_REQUEST:
            return action.payload;
        case balanceRequestActionType.UPDATE_BALANCE_REQUEST_STATUS:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case balanceRequestActionType.DELETE_BALANCE_REQUEST:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};
