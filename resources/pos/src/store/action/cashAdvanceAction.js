import apiConfig from "../../config/apiConfig";
import { apiBaseURL, cashAdvanceActionType, toastType } from "../../constants";
import requestParam from "../../shared/requestParam";
import { addToast } from "./toastAction";
import {
    addInToTotalRecord,
    removeFromTotalRecord,
    setTotalRecord,
} from "./totalRecordAction";
import { setLoading } from "./loadingAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setSavingButton } from "./saveButtonAction";
import { callFetchDataApi } from "./updateBrand";

const resolveApiErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || null;

const notifyAndStopLoading = (dispatch, error, shouldStopLoading = false) => {
    if (shouldStopLoading) {
        dispatch(setLoading(false));
    }

    const message = resolveApiErrorMessage(error);

    if (!message || message === getFormattedMessage("toast.error.title")) {
        return;
    }

    dispatch(
        addToast({
            text: message,
            type: toastType.ERROR,
        })
    );
};

export const fetchCashAdvances =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = apiBaseURL.CASH_ADVANCES;
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
                    type: cashAdvanceActionType.FETCH_CASH_ADVANCES,
                    payload: response.data.data,
                });
                dispatch({
                    type: cashAdvanceActionType.SET_CASH_ADVANCE_SUMMARY,
                    payload: response.data.summary ?? {},
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
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, isLoading);
            });
    };

export const fetchCashAdvance = (cashAdvanceId, singleCashAdvance) => async (dispatch) => {
    return apiConfig
        .get(apiBaseURL.CASH_ADVANCES + "/" + cashAdvanceId, singleCashAdvance)
        .then((response) => {
            dispatch({
                type: cashAdvanceActionType.FETCH_CASH_ADVANCE,
                payload: response.data.data,
            });
        })
        .catch((error) => {
            const message = resolveApiErrorMessage(error);

            if (!message || message === getFormattedMessage("toast.error.title")) {
                throw error;
            }

            dispatch(
                addToast({
                    text: message,
                    type: toastType.ERROR,
                })
            );

            // Re-throw the error so it can be caught by the component
            throw error;
        });
};

export const addCashAdvance = (cashAdvance, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(apiBaseURL.CASH_ADVANCES, cashAdvance)
        .then((response) => {
            dispatch({
                type: cashAdvanceActionType.ADD_CASH_ADVANCE,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("cash-advance.success.create.message"),
                })
            );
            navigate("/user/cash-advance-identities");
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch((error) => {
            dispatch(setSavingButton(false));
 
            const message = resolveApiErrorMessage(error);
 
            // Handle specific error for inactive identity
            if (error.response?.status === 422 && error.response?.data?.errors?.identity_id) {
                const errorMessage = error.response?.data?.errors?.identity_id;
                if (errorMessage.includes('inactive')) {
                    dispatch(
                        addToast({
                            text: getFormattedMessage("cash-advance.identity_inactive"),
                            type: toastType.ERROR,
                        })
                    );
                } else if (errorMessage.includes('not found')) {
                    dispatch(
                        addToast({
                            text: getFormattedMessage("cash-advance.identity_not_found"),
                            type: toastType.ERROR,
                        })
                    );
                }
                return;
            }
 
            if (!message || message === getFormattedMessage("toast.error.title")) {
                return;
            }
 
            dispatch(
                addToast({
                    text: message,
                    type: toastType.ERROR,
                })
            );
        });
};

export const editCashAdvance =
    (cashAdvanceId, cashAdvance, navigate) => async (dispatch) => {
        dispatch(setSavingButton(true));
        apiConfig
            .put(apiBaseURL.CASH_ADVANCES + "/" + cashAdvanceId, cashAdvance)
            .then((response) => {
                dispatch({
                    type: cashAdvanceActionType.EDIT_CASH_ADVANCE,
                    payload: response.data.data,
                });
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "cash-advance.success.edit.message"
                        ),
                    })
                );
                navigate("/user/cash-advance-identities");
                dispatch(setSavingButton(false));
            })
            .catch((error) => {
                dispatch(setSavingButton(false));
     
                const message = resolveApiErrorMessage(error);
     
                // Handle specific error for inactive identity
                if (error.response?.status === 422 && error.response?.data?.errors?.identity_id) {
                    const errorMessage = error.response?.data?.errors?.identity_id;
                    if (errorMessage.includes('inactive')) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage("cash-advance.identity_inactive"),
                                type: toastType.ERROR,
                            })
                        );
                    } else if (errorMessage.includes('not found')) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage("cash-advance.identity_not_found"),
                                type: toastType.ERROR,
                            })
                        );
                    }
                    return;
                }
     
                if (!message || message === getFormattedMessage("toast.error.title")) {
                    return;
                }
     
                dispatch(
                    addToast({
                            text: message,
                            type: toastType.ERROR,
                        })
                    );
            });
    };

export const deleteCashAdvance = (cashAdvanceId) => async (dispatch) => {
    return apiConfig
        .delete(apiBaseURL.CASH_ADVANCES + "/" + cashAdvanceId)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: cashAdvanceActionType.DELETE_CASH_ADVANCE,
                payload: cashAdvanceId,
            });
            dispatch(callFetchDataApi(true));
            dispatch(
                addToast({
                    text: getFormattedMessage("cash-advance.success.delete.message"),
                })
            );
            return response;
        })
        .catch((error) => {
            const message = resolveApiErrorMessage(error);

            if (!message || message === getFormattedMessage("toast.error.title")) {
                throw error;
            }

            dispatch(
                addToast({
                    text: message,
                    type: toastType.ERROR,
                })
            );
            throw error;
        });
};
