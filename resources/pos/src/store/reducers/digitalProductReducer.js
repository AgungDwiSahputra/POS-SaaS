import { digitalProductActionType } from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case digitalProductActionType.FETCH_DIGITAL_PRODUCTS:
            return [...action.payload];
        case digitalProductActionType.FETCH_DIGITAL_PRODUCT:
            console.log('Reducer: FETCH_DIGITAL_PRODUCT:', action.payload);
            return [action.payload];
        case digitalProductActionType.ADD_DIGITAL_PRODUCT:
            return action.payload;
        case digitalProductActionType.EDIT_DIGITAL_PRODUCT:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case digitalProductActionType.DELETE_DIGITAL_PRODUCT:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};