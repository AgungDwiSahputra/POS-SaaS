import apiConfig from "../../config/apiConfig";
import { handleApiError } from "../../shared/utils/errorHandler";
import { addToast } from "./toastAction";
import { toastType } from "../../constants";

export const digitalTopupRequestActionType = {
    FETCH_DIGITAL_TOPUP_REQUESTS: "FETCH_DIGITAL_TOPUP_REQUESTS",
    FETCH_DIGITAL_TOPUP_REQUEST: "FETCH_DIGITAL_TOPUP_REQUEST",
    ADD_DIGITAL_TOPUP_REQUEST: "ADD_DIGITAL_TOPUP_REQUEST",
    EDIT_DIGITAL_TOPUP_REQUEST: "EDIT_DIGITAL_TOPUP_REQUEST",
    DELETE_DIGITAL_TOPUP_REQUEST: "DELETE_DIGITAL_TOPUP_REQUEST",
    APPROVE_DIGITAL_TOPUP_REQUEST: "APPROVE_DIGITAL_TOPUP_REQUEST",
    REJECT_DIGITAL_TOPUP_REQUEST: "REJECT_DIGITAL_TOPUP_REQUEST",
    COMPLETE_DIGITAL_TOPUP_REQUEST: "COMPLETE_DIGITAL_TOPUP_REQUEST",
    FETCH_PENDING_DIGITAL_TOPUP_REQUESTS: "FETCH_PENDING_DIGITAL_TOPUP_REQUESTS",
    UPDATE_DIGITAL_TOPUP_REQUEST: "UPDATE_DIGITAL_TOPUP_REQUEST",
};

export const fetchDigitalTopupRequests = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch({ type: "SET_LOADING", payload: true });
    }

    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page);
    if (filter.pageSize) params.append("pageSize", filter.pageSize);
    if (filter.store_id) params.append("store_id", filter.store_id);
    if (filter.status) params.append("status", filter.status);

    const query = params.toString();
    const url = query ? `digital-topup-requests?${query}` : "digital-topup-requests";

    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: digitalTopupRequestActionType.FETCH_DIGITAL_TOPUP_REQUESTS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Digital Topup Requests");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital topup requests",
                type: toastType.ERROR,
            })
        );
    } finally {
        if (isLoading) {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }
};

export const fetchDigitalTopupRequest = (id) => async (dispatch) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
        const response = await apiConfig.get(`digital-topup-requests/${id}`);
        dispatch({
            type: digitalTopupRequestActionType.FETCH_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Topup Request ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital topup request",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_LOADING", payload: false });
    }
};

export const addDigitalTopupRequest = (topupRequest, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post("digital-topup-requests", topupRequest);
        dispatch({
            type: digitalTopupRequestActionType.ADD_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital topup request created successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-topup-requests");
    } catch (error) {
        const standardizedError = handleApiError(error, "Create Digital Topup Request");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to create digital topup request",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const createDigitalTopupRequest = (topupRequest) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post("digital-topup-requests", topupRequest);
        dispatch({
            type: digitalTopupRequestActionType.ADD_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital topup request created successfully",
                type: toastType.SUCCESS,
            })
        );
        return response.data;
    } catch (error) {
        const standardizedError = handleApiError(error, "Create Digital Topup Request");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to create digital topup request",
                type: toastType.ERROR,
            })
        );
        throw error;
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const approveDigitalTopupRequest = (id, adminNotes, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post(`digital-topup-requests/${id}/approve`, {
            admin_notes: adminNotes
        });
        dispatch({
            type: digitalTopupRequestActionType.APPROVE_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital topup request approved successfully",
                type: toastType.SUCCESS,
            })
        );
        if (navigate) {
            navigate("/user/digital/digital-topup-requests");
        }
    } catch (error) {
        const standardizedError = handleApiError(error, `Approve Digital Topup Request ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to approve digital topup request",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const rejectDigitalTopupRequest = (id, adminNotes, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post(`digital-topup-requests/${id}/reject`, {
            admin_notes: adminNotes
        });
        dispatch({
            type: digitalTopupRequestActionType.REJECT_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital topup request rejected successfully",
                type: toastType.SUCCESS,
            })
        );
        if (navigate) {
            navigate("/user/digital/digital-topup-requests");
        }
    } catch (error) {
        const standardizedError = handleApiError(error, `Reject Digital Topup Request ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to reject digital topup request",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const completeDigitalTopupRequest = (id) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post(`digital-topup-requests/${id}/complete`);
        dispatch({
            type: digitalTopupRequestActionType.COMPLETE_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital topup request completed successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Complete Digital Topup Request ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to complete digital topup request",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const deleteDigitalTopupRequest = (id) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        await apiConfig.delete(`digital-topup-requests/${id}`);
        dispatch({
            type: digitalTopupRequestActionType.DELETE_DIGITAL_TOPUP_REQUEST,
            payload: id,
        });
        dispatch(
            addToast({
                text: "Digital topup request deleted successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Delete Digital Topup Request ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to delete digital topup request",
                type: toastType.ERROR,
            })
        );
        throw error;
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const editDigitalTopupRequest = (id, topupRequestData) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.put(`digital-topup-requests/${id}`, topupRequestData);
        dispatch({
            type: digitalTopupRequestActionType.UPDATE_DIGITAL_TOPUP_REQUEST,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital topup request updated successfully",
                type: toastType.SUCCESS,
            })
        );
        return response.data;
    } catch (error) {
        const standardizedError = handleApiError(error, "Update Digital Topup Request");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to update digital topup request",
                type: toastType.ERROR,
            })
        );
        throw error;
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const fetchPendingDigitalTopupRequests = () => async (dispatch) => {
    try {
        const response = await apiConfig.get("digital-topup-requests/pending");
        dispatch({
            type: digitalTopupRequestActionType.FETCH_PENDING_DIGITAL_TOPUP_REQUESTS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Pending Digital Topup Requests");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch pending digital topup requests",
                type: toastType.ERROR,
            })
        );
    }
};
