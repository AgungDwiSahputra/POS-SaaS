import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType } from "../../constants";
import { addToast } from "./toastAction";
import { setLoading } from "./loadingAction";

export const fetchCashAdvancesByIdentity = (name, warehouseId, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    
    let url = apiBaseURL.CASH_ADVANCES_BY_IDENTITY;
    const params = new URLSearchParams();
    
    if (name) {
        params.append('name', name);
    }
    if (warehouseId) {
        params.append('warehouse_id', warehouseId);
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: "FETCH_CASH_ADVANCES_BY_IDENTITY",
            payload: response.data.data
        });
        if (isLoading) {
            dispatch(setLoading(false));
        }
        return response.data.data;
    } catch (error) {
        dispatch(setLoading(false));
        dispatch(addToast({
            text: error.response?.data?.message || "Failed to fetch cash advances by identity",
            type: toastType.ERROR,
        }));
        throw error;
    }
};

export const createCashAdvanceWithSameIdentity = (data, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    
    try {
        const response = await apiConfig.post(apiBaseURL.CASH_ADVANCES_WITH_SAME_IDENTITY, data);
        dispatch({
            type: "CREATE_CASH_ADVANCE_WITH_SAME_IDENTITY",
            payload: response.data.data
        });
        if (isLoading) {
            dispatch(setLoading(false));
        }
        dispatch(addToast({
            text: "Cash advance created successfully with same identity",
            type: toastType.SUCCESS,
        }));
        return response.data.data;
    } catch (error) {
        dispatch(setLoading(false));
        dispatch(addToast({
            text: error.response?.data?.message || "Failed to create cash advance",
            type: toastType.ERROR,
        }));
        throw error;
    }
};
