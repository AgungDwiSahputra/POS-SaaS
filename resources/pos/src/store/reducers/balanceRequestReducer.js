import { balanceRequestActionType } from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case balanceRequestActionType.FETCH_BALANCE_REQUESTS:
            return [...action.payload];
        case balanceRequestActionType.FETCH_BALANCE_REQUEST:
            return [action.payload];
        case balanceRequestActionType.ADD_BALANCE_REQUEST:
            return [...state, action.payload];
        case balanceRequestActionType.APPROVE_BALANCE_REQUEST:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case balanceRequestActionType.REJECT_BALANCE_REQUEST:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        default:
            return state;
    }
};