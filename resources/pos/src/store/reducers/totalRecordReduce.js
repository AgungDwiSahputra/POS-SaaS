import {constants} from '../../constants';

export default (state = 0, action) => {
    switch (action.type) {
        case constants.SET_TOTAL_RECORD:
            if (action.payload === undefined || action.payload === null) {
                return state;
            }

            return action.payload;
        case constants.UPDATE_TOTAL_RECORD_AFTER_DELETE:
            if (typeof action.payload !== "number") {
                return state;
            }

            return state - action.payload;
        case constants.UPDATE_TOTAL_RECORD_AFTER_ADD:
            if (typeof action.payload !== "number") {
                return state;
            }

            return state + action.payload;
        default:
            return state;
    }
}
