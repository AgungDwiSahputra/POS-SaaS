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
            if (
                !_.isEmpty(filter) &&
                (filter.page ||
                    filter.pageSize ||
                    filter.search ||
                    filter.order_By ||
                    filter.created_at ||
                    filter.status)
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
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                });
        };

export const fetchBalanceRequest =
    (requestId, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.BALANCE_REQUESTS + "/" + requestId)
                .then((response) => {
                    dispatch({
                        type: balanceRequestActionType.FETCH_BALANCE_REQUEST,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    let errorMessage = 'An error occurred while fetching balance request';

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
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                });
        };

export const addBalanceRequest = (balanceRequest, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));

    await apiConfig
        .post(apiBaseURL.BALANCE_REQUESTS, balanceRequest)
        .then((response) => {
            // Handle nested data structure from sendResponse -> BalanceRequestResource
            const payload = response.data?.data?.data || response.data?.data;
            dispatch({
                type: balanceRequestActionType.ADD_BALANCE_REQUEST,
                payload: payload,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("balance-request.success.create.message"),
                })
            );
            navigate("/user/balance-requests");
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
                if (typeof errors === 'object') {
                    errorMessage = Object.values(errors).join(', ');
                }
            }

            dispatch(
                addToast({
                    text: errorMessage,
                    type: toastType.ERROR
                })
            );
        });
};

export const updateBalanceRequestStatus =
    (requestId, data, navigate) => async (dispatch) => {
        dispatch(setSavingButton(true));
        apiConfig
            .post(apiBaseURL.BALANCE_REQUESTS + "/" + requestId + "/status", data)
            .then((response) => {
                // Handle nested data structure from sendResponse -> BalanceRequestResource
                const payload = response.data?.data?.data || response.data?.data;
                dispatch({
                    type: balanceRequestActionType.UPDATE_BALANCE_REQUEST_STATUS,
                    payload: payload,
                });
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "balance-request.success.update.message"
                        ),
                    })
                );
                if (navigate) {
                    navigate("/user/balance-requests");
                }
                dispatch(setSavingButton(false));
            })
            .catch(({ response }) => {
                dispatch(setSavingButton(false));

                let errorMessage = 'An error occurred while updating balance request';

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

export const deleteBalanceRequest = (requestId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.BALANCE_REQUESTS + "/" + requestId)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: balanceRequestActionType.DELETE_BALANCE_REQUEST,
                payload: requestId,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("balance-request.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            let errorMessage = 'An error occurred while deleting balance request';

            if (response?.data?.message) {
                errorMessage = response.data.message;
            } else if (response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            dispatch(
                addToast({ text: errorMessage, type: toastType.ERROR })
            );
        });
};

export const fetchBalanceRequestPendingCount = () => async (dispatch) => {
    apiConfig
        .get(apiBaseURL.BALANCE_REQUESTS + "-pending-count")
        .then((response) => {
            dispatch({
                type: balanceRequestActionType.FETCH_BALANCE_REQUEST_PENDING_COUNT,
                payload: response.data.data.count,
            });
        })
        .catch(({ response }) => {
            // Silently fail for pending count
            console.error('Failed to fetch pending count:', response);
        });
};
