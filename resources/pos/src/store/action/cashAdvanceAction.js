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
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.ERROR,
                    })
                );
            });
    };

export const fetchCashAdvance = (cashAdvanceId, singleCashAdvance) => async (dispatch) => {
    apiConfig
        .get(apiBaseURL.CASH_ADVANCES + "/" + cashAdvanceId, singleCashAdvance)
        .then((response) => {
            dispatch({
                type: cashAdvanceActionType.FETCH_CASH_ADVANCE,
                payload: response.data.data,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
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
            navigate("/user/cash-advances");
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
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
                navigate("/user/cash-advances");
                dispatch(setSavingButton(false));
            })
            .catch(({ response }) => {
                dispatch(setSavingButton(false));
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.ERROR,
                    })
                );
            });
    };

export const deleteCashAdvance = (cashAdvanceId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.CASH_ADVANCES + "/" + cashAdvanceId)
        .then(() => {
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
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};
