import apiConfig from "../../config/apiConfig";
import { handleApiError } from "../../shared/utils/errorHandler";
import { addToast } from "./toastAction";
import { toastType } from "../../constants";

export const digitalWithdrawalActionType = {
    FETCH_DIGITAL_WITHDRAWALS: "FETCH_DIGITAL_WITHDRAWALS",
    FETCH_DIGITAL_WITHDRAWAL: "FETCH_DIGITAL_WITHDRAWAL",
    ADD_DIGITAL_WITHDRAWAL: "ADD_DIGITAL_WITHDRAWAL",
    EDIT_DIGITAL_WITHDRAWAL: "EDIT_DIGITAL_WITHDRAWAL",
    DELETE_DIGITAL_WITHDRAWAL: "DELETE_DIGITAL_WITHDRAWAL",
    FETCH_DIGITAL_WITHDRAWALS_BY_STORE: "FETCH_DIGITAL_WITHDRAWALS_BY_STORE",
    FETCH_DIGITAL_WITHDRAWALS_SUMMARY: "FETCH_DIGITAL_WITHDRAWALS_SUMMARY",
};

export const fetchDigitalWithdrawals = (filter = {}, isLoading = true) => async (dispatch) => {
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
    const url = query ? `digital-withdrawals?${query}` : "digital-withdrawals";

    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWALS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Digital Withdrawals");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital withdrawals",
                type: toastType.ERROR,
            })
        );
    } finally {
        if (isLoading) {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }
};

export const fetchDigitalWithdrawal = (id) => async (dispatch) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
        const response = await apiConfig.get(`digital-withdrawals/${id}`);
        dispatch({
            type: digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWAL,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Withdrawal ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital withdrawal",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_LOADING", payload: false });
    }
};

export const addDigitalWithdrawal = (digitalWithdrawal, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post("digital-withdrawals", digitalWithdrawal);
        dispatch({
            type: digitalWithdrawalActionType.ADD_DIGITAL_WITHDRAWAL,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital withdrawal created successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-withdrawals");
    } catch (error) {
        const standardizedError = handleApiError(error, "Create Digital Withdrawal");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to create digital withdrawal",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const editDigitalWithdrawal = (id, digitalWithdrawal, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.put(`digital-withdrawals/${id}`, digitalWithdrawal);
        dispatch({
            type: digitalWithdrawalActionType.EDIT_DIGITAL_WITHDRAWAL,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital withdrawal updated successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-withdrawals");
    } catch (error) {
        const standardizedError = handleApiError(error, `Update Digital Withdrawal ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to update digital withdrawal",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const deleteDigitalWithdrawal = (id) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        await apiConfig.delete(`digital-withdrawals/${id}`);
        dispatch({
            type: digitalWithdrawalActionType.DELETE_DIGITAL_WITHDRAWAL,
            payload: id,
        });
        dispatch(
            addToast({
                text: "Digital withdrawal deleted successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Delete Digital Withdrawal ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to delete digital withdrawal",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const fetchDigitalWithdrawalsByStore = (storeId) => async (dispatch) => {
    try {
        const response = await apiConfig.get(`digital-withdrawals/store/${storeId}`);
        dispatch({
            type: digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWALS_BY_STORE,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Withdrawals By Store: ${storeId}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital withdrawals by store",
                type: toastType.ERROR,
            })
        );
    }
};

export const fetchDigitalWithdrawalsSummary = (filter = {}) => async (dispatch) => {
    const params = new URLSearchParams();
    if (filter.store_id) params.append("store_id", filter.store_id);
    if (filter.start_date) params.append("start_date", filter.start_date);
    if (filter.end_date) params.append("end_date", filter.end_date);

    const query = params.toString();
    const url = query ? `digital-withdrawals/summary?${query}` : "digital-withdrawals/summary";

    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: digitalWithdrawalActionType.FETCH_DIGITAL_WITHDRAWALS_SUMMARY,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Digital Withdrawals Summary");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital withdrawals summary",
                type: toastType.ERROR,
            })
        );
    }
};
