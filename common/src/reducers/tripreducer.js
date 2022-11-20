import {
    UPDATE_TRIP_PICKUP,
    UPDATE_TRIP_DROP,
    UPDATE_TRIP_CAR,
    UPDATE_SELECTED_POINT_TYPE,
    CLEAR_TRIP_POINTS
} from "../store/types";

const INITIAL_STATE = {
    pickup: null,
    drop: null,
    carType: null,
    selected:'pickup'
}

export const tripreducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UPDATE_TRIP_PICKUP:
            return {
                ...state,
                pickup:action.payload
            };
        case UPDATE_TRIP_DROP:
            return {
                ...state,
                drop:action.payload
            };
        case UPDATE_TRIP_CAR:
            return {
                ...state,
                carType:action.payload
            };
        case UPDATE_SELECTED_POINT_TYPE:
            return {
                ...state,
                selected:action.payload
            };
        case CLEAR_TRIP_POINTS:
            return INITIAL_STATE;
        default:
            return state;
    }
};