import apiConfig from "../../config/apiConfig";
import { cashAdvanceIdentityActionType, toastType } from "../../constants";
import requestParam from "../../shared/requestParam";
import { addToast } from "./toastAction";
import {
    addInToTotalRecord,
    removeFromTotalRecord,
    setTotalRecord,
} from "./totalRecordAction";
import { setLoading } from "./loadingAction";
import { getFormattedMessage } from "../../shared/sharedMethod";

const notifyAndStopLoading = (dispatch, error, isLoading) => {
    if (isLoading) {
        dispatch(setLoading(false));
    }
    dispatch(
        addToast({
            type: toastType.ERROR,
            message: error.response?.data?.message || error.message,
        })
    );
};

export const fetchCashAdvanceIdentities = (filter) => {
    return (dispatch) => {
        let url = "cash-advance-identities";
        if (filter && Object.keys(filter).length > 0) {
            url += requestParam(filter, null, null, null, url);
        }
        apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.FETCH_CASH_ADVANCE_IDENTITIES,
                    payload: response.data.data,
                    totalRecord: response.data.meta?.total || response.data.data?.length || 0,
                    isLoading: false,
                    isCallFetchDataApi: true,
                });
                dispatch(setTotalRecord(response.data.meta?.total || response.data.data?.length || 0));
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, false);
            });
    };
};

export const addCashAdvanceIdentity = (formValue, navigate) => {
    return (dispatch) => {
        dispatch(setLoading(true));
        apiConfig
            .post("cash-advance-identities", formValue)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.ADD_CASH_ADVANCE_IDENTITY,
                    isLoading: false,
                });
                dispatch(addInToTotalRecord(1));
                dispatch(
                    addToast({
                        type: toastType.SUCCESS,
                        message: getFormattedMessage("cash-advance-identity.success.create.message"),
                    })
                );
                navigate("/user/cash-advance-identities");
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, true);
            });
    };
};

export const editCashAdvanceIdentity = (id, formValue, navigate) => {
    return (dispatch) => {
        dispatch(setLoading(true));
        apiConfig
            .put(`cash-advance-identities/${id}`, formValue)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.EDIT_CASH_ADVANCE_IDENTITY,
                    isLoading: false,
                });
                dispatch(
                    addToast({
                        type: toastType.SUCCESS,
                        message: getFormattedMessage("cash-advance-identity.success.edit.message"),
                    })
                );
                navigate("/user/cash-advance-identities");
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, true);
            });
    };
};

export const deleteCashAdvanceIdentity = (id, onDeleteModel) => {
    return (dispatch) => {
        dispatch(setLoading(true));
        apiConfig
            .delete(`cash-advance-identities/${id}`)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.DELETE_CASH_ADVANCE_IDENTITY,
                    isLoading: false,
                });
                dispatch(removeFromTotalRecord(1));
                dispatch(
                    addToast({
                        type: toastType.SUCCESS,
                        message: getFormattedMessage("cash-advance-identity.success.delete.message"),
                    })
                );
                onDeleteModel();
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, true);
            });
    };
};

export const fetchCashAdvanceIdentity = (id) => {
    return (dispatch) => {
        dispatch(setLoading(true));
        apiConfig
            .get(`cash-advance-identities/${id}`)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.FETCH_CASH_ADVANCE_IDENTITY,
                    payload: [response.data.data],
                    isLoading: false,
                });
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, true);
            });
    };
};

export const fetchCashAdvanceIdentityWithHistory = (id) => {
    return (dispatch) => {
        dispatch(setLoading(true));
        apiConfig
            .get(`cash-advance-identities/${id}/history`)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.FETCH_CASH_ADVANCE_IDENTITY,
                    payload: [response.data.data],
                    isLoading: false,
                });
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, true);
            });
    };
};

export const fetchActiveIdentitiesForSelect = () => {
    return (dispatch) => {
        apiConfig
            .get("active-identities-for-select")
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.FETCH_ACTIVE_IDENTITIES_FOR_SELECT,
                    payload: response.data.data || response.data,
                    isLoading: false,
                });
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, false);
            });
    };
};

export const fetchIdentitiesWithSummary = (filter = {}) => {
    return (dispatch) => {
        dispatch(setLoading(true));
        let url = "cash-advance-identities-with-summary";
        if (filter && Object.keys(filter).length > 0) {
            url += requestParam(filter, null, null, null, url);
        }
        apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: cashAdvanceIdentityActionType.FETCH_IDENTITIES_WITH_SUMMARY,
                    payload: response.data.data || response.data,
                    isLoading: false,
                });
            })
            .catch((error) => {
                notifyAndStopLoading(dispatch, error, true);
            });
    };
};

