import apiConfig from "../../config/apiConfig";
import { handleApiError } from "../../shared/utils/errorHandler";
import { addToast } from "./toastAction";
import { toastType } from "../../constants";

export const digitalSaleActionType = {
    FETCH_DIGITAL_SALES: "FETCH_DIGITAL_SALES",
    FETCH_DIGITAL_SALE: "FETCH_DIGITAL_SALE",
    ADD_DIGITAL_SALE: "ADD_DIGITAL_SALE",
    EDIT_DIGITAL_SALE: "EDIT_DIGITAL_SALE",
    DELETE_DIGITAL_SALE: "DELETE_DIGITAL_SALE",
    FETCH_DIGITAL_SALES_BY_STORE: "FETCH_DIGITAL_SALES_BY_STORE",
    FETCH_DIGITAL_SALES_SUMMARY: "FETCH_DIGITAL_SALES_SUMMARY",
};

export const fetchDigitalSales = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch({ type: "SET_LOADING", payload: true });
    }

    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page);
    if (filter.pageSize) params.append("pageSize", filter.pageSize);
    if (filter.store_id) params.append("store_id", filter.store_id);
    if (filter.digital_provider_id) params.append("digital_provider_id", filter.digital_provider_id);
    if (filter.status) params.append("status", filter.status);
    if (filter.start_date) params.append("start_date", filter.start_date);
    if (filter.end_date) params.append("end_date", filter.end_date);

    const query = params.toString();
    const url = query ? `digital-sales?${query}` : "digital-sales";

    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: digitalSaleActionType.FETCH_DIGITAL_SALES,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Digital Sales");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital sales",
                type: toastType.ERROR,
            })
        );
    } finally {
        if (isLoading) {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }
};

export const fetchDigitalSale = (id) => async (dispatch) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
        const response = await apiConfig.get(`digital-sales/${id}`);
        dispatch({
            type: digitalSaleActionType.FETCH_DIGITAL_SALE,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Sale ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital sale",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_LOADING", payload: false });
    }
};

export const addDigitalSale = (digitalSale, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post("digital-sales", digitalSale);
        dispatch({
            type: digitalSaleActionType.ADD_DIGITAL_SALE,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital sale created successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-sales");
    } catch (error) {
        const standardizedError = handleApiError(error, "Create Digital Sale");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to create digital sale",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const editDigitalSale = (id, digitalSale, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.put(`digital-sales/${id}`, digitalSale);
        dispatch({
            type: digitalSaleActionType.EDIT_DIGITAL_SALE,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital sale updated successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-sales");
    } catch (error) {
        const standardizedError = handleApiError(error, `Update Digital Sale ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to update digital sale",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const deleteDigitalSale = (id) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        await apiConfig.delete(`digital-sales/${id}`);
        dispatch({
            type: digitalSaleActionType.DELETE_DIGITAL_SALE,
            payload: id,
        });
        dispatch(
            addToast({
                text: "Digital sale deleted successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Delete Digital Sale ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to delete digital sale",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const fetchDigitalSalesByStore = (storeId) => async (dispatch) => {
    try {
        const response = await apiConfig.get(`digital-sales/store/${storeId}`);
        dispatch({
            type: digitalSaleActionType.FETCH_DIGITAL_SALES_BY_STORE,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Sales By Store: ${storeId}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital sales by store",
                type: toastType.ERROR,
            })
        );
    }
};

export const fetchDigitalSalesSummary = (filter = {}) => async (dispatch) => {
    const params = new URLSearchParams();
    if (filter.store_id) params.append("store_id", filter.store_id);
    if (filter.start_date) params.append("start_date", filter.start_date);
    if (filter.end_date) params.append("end_date", filter.end_date);

    const query = params.toString();
    const url = query ? `digital-sales/summary?${query}` : "digital-sales/summary";

    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: digitalSaleActionType.FETCH_DIGITAL_SALES_SUMMARY,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Digital Sales Summary");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital sales summary",
                type: toastType.ERROR,
            })
        );
    }
};
