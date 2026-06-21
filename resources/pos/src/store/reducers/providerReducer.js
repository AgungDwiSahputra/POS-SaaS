import { providerActionType } from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case providerActionType.FETCH_PROVIDERS:
            return [...action.payload];
        case providerActionType.FETCH_PROVIDER:
            console.log('Reducer: FETCH_PROVIDER:', action.payload);
            return [action.payload];
        case providerActionType.ADD_PROVIDER:
            return action.payload;
        case providerActionType.EDIT_PROVIDER:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case providerActionType.DELETE_PROVIDER:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};