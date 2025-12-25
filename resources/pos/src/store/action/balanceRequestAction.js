import apiConfig from "../../config/apiConfigWthFormData";
import { apiBaseURL, balanceRequestActionType, toastType } from "../../constants";
import { addToast } from "./toastAction";
import {
    setTotalRecord,
    addInToTotalRecord,
    removeFromTotalRecord,
} from "./totalRecordAction";
import requestParam from "../../shared/requestParam";
import { setLoading } from "./loadingAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setSavingButton } from "./saveButtonAction";

export const fetchBalanceRequests =
    (filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.BALANCE_REQUESTS;
            // Add include parameter for provider relationship
            url += "?include=provider";
            if (
                !_.isEmpty(filter) &&
                (filter.page ||
                    filter.pageSize ||
                    filter.search ||
                    filter.order_By ||
                    filter.created_at)
            ) {
                url += requestParam(filter, null, null, null, url);
            }
            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: balanceRequestActionType.FETCH_BALANCE_REQUESTS,
                        payload: response.data.data,
                    });
                    dispatch(
                        setTotalRecord(
                            response.data.meta.total !== undefined &&
                                response.data.meta.total >= 0
                                ? response.data.meta.total
                                : response.data.data.total
                        )
                    );
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    let errorMessage = 'An error occurred while fetching balance requests';

                    if (response?.data?.message) {
                        errorMessage = response.data.message;
                    } else if (response?.status === 401) {
                        errorMessage = 'Authentication required. Please log in again.';
                    } else if (response?.status >= 500) {
                        errorMessage = 'Server error. Please try again later.';
                    }

                    dispatch(
                        addToast({
                            text: errorMessage,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const addBalanceRequest = (balanceRequest, callback) => async (dispatch) => {
    dispatch(setSavingButton(true));

    await apiConfig
        .post(apiBaseURL.BALANCE_REQUESTS, balanceRequest)
        .then((response) => {
            dispatch({
                type: balanceRequestActionType.ADD_BALANCE_REQUEST,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("balance-request.success.create.message"),
                })
            );
            // Call the callback if provided (for modal) or navigate if it's a string
            if (typeof callback === 'function') {
                callback();
            } else if (callback && typeof callback === 'string') {
                // For backward compatibility with navigate string
                window.location.href = callback;
            }
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));

            let errorMessage = 'An error occurred while creating balance request';

            if (response?.data?.message) {
                errorMessage = response.data.message;
            } else if (response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (response?.data?.errors) {
                // Handle validation errors
                const errors = response.data.errors;
                const firstError = Object.values(errors)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            }

            dispatch(
                addToast({
                    text: errorMessage,
                    type: toastType.ERROR
                })
            );
        });
};

export const approveBalanceRequest = (id) => async (dispatch) => {
    await apiConfig
        .post(`${apiBaseURL.BALANCE_REQUESTS}/${id}/approve`)
        .then((response) => {
            dispatch({
                type: balanceRequestActionType.APPROVE_BALANCE_REQUEST,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("balance-request.approve.success"),
                })
            );
        })
        .catch(({ response }) => {
            let errorMessage = 'An error occurred while approving balance request';

            if (response?.data?.message) {
                errorMessage = response.data.message;
            } else if (response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (response?.status === 403) {
                errorMessage = 'You do not have permission to approve balance requests.';
            } else if (response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            dispatch(
                addToast({
                    text: errorMessage,
                    type: toastType.ERROR
                })
            );
        });
};

export const rejectBalanceRequest = (id) => async (dispatch) => {
    await apiConfig
        .post(`${apiBaseURL.BALANCE_REQUESTS}/${id}/reject`)
        .then((response) => {
            dispatch({
                type: balanceRequestActionType.REJECT_BALANCE_REQUEST,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("balance-request.reject.success"),
                })
            );
        })
        .catch(({ response }) => {
            let errorMessage = 'An error occurred while rejecting balance request';

            if (response?.data?.message) {
                errorMessage = response.data.message;
            } else if (response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (response?.status === 403) {
                errorMessage = 'You do not have permission to reject balance requests.';
            } else if (response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            dispatch(
                addToast({
                    text: errorMessage,
                    type: toastType.ERROR
                })
            );
        });
};