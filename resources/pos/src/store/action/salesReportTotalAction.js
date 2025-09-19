import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType } from "../../constants";
import { addToast } from "./toastAction";
import { setLoading } from "./loadingAction";

export const fetchSalesReportTotal = (dates, warehouseId, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    
    let url = apiBaseURL.SALES_REPORT_TOTAL;
    const params = new URLSearchParams();
    
    if (dates?.start_date) {
        params.append('start_date', dates.start_date);
    }
    if (dates?.end_date) {
        params.append('end_date', dates.end_date);
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
            type: "FETCH_SALES_REPORT_TOTAL",
            payload: response.data.data
        });
        if (isLoading) {
            dispatch(setLoading(false));
        }
        return response.data.data;
    } catch (error) {
        dispatch(setLoading(false));
        dispatch(addToast({
            text: error.response?.data?.message || "Failed to fetch sales report total",
            type: toastType.ERROR,
        }));
        throw error;
    }
};
