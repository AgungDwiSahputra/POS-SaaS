import apiConfig from "../../config/apiConfig";
import { apiBaseURL, digitalSaleActionType, toastType } from "../../constants";
import { addToast } from "./toastAction";
import {
    addInToTotalRecord,
    removeFromTotalRecord,
    setTotalRecord,
} from "./totalRecordAction";
import { setLoading } from "./loadingAction";
import requestParam from "../../shared/requestParam";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setSavingButton } from "./saveButtonAction";
import { callFetchDataApi } from "./updateBrand";

export const fetchDigitalSales =
    (filter = {}, isLoading = true, shouldAppend = false) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            const admin = true;
            let url = apiBaseURL.DIGITAL_SALES;
            if (
                !_.isEmpty(filter) &&
                (filter.page ||
                    filter.pageSize ||
                    filter.search ||
                    filter.order_By ||
                    filter.created_at ||
                    filter.provider_id ||
                    filter.user_id ||
                    filter.type ||
                    filter.start_date ||
                    filter.end_date ||
                    filter.status)
            ) {
                url += requestParam(filter, admin, null, null, url);
            }
            await apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: digitalSaleActionType.FETCH_DIGITAL_SALES,
                        payload: response.data.data,
                        meta: { append: shouldAppend },
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

export const fetchDigitalSale =
    (saleId, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            await apiConfig
                .get(apiBaseURL.DIGITAL_SALES + "/" + saleId + "/edit")
                .then((response) => {
                    dispatch({
                        type: digitalSaleActionType.FETCH_DIGITAL_SALE,
                        payload: response.data.data,
                    });
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

export const addDigitalSale = (sale, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(apiBaseURL.DIGITAL_SALES, sale)
        .then((response) => {
            dispatch({
                type: digitalSaleActionType.ADD_DIGITAL_SALE,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("digital-sales.success.create.message"),
                })
            );
            dispatch(addInToTotalRecord(1));
            navigate("/user/digital-sales");
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const editDigitalSale = (saleId, sale, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .patch(apiBaseURL.DIGITAL_SALES + "/" + saleId, sale)
        .then((response) => {
            dispatch({
                type: digitalSaleActionType.EDIT_DIGITAL_SALE,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("digital-sales.success.edit.message"),
                })
            );
            navigate("/user/digital-sales");
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const deleteDigitalSale = (userId) => async (dispatch) => {
    await apiConfig
        .delete(apiBaseURL.DIGITAL_SALES + "/" + userId)
        .then(() => {
            dispatch(callFetchDataApi(true));
            dispatch(removeFromTotalRecord(1));
            dispatch({ type: digitalSaleActionType.DELETE_DIGITAL_SALE, payload: userId });
            dispatch(
                addToast({
                    text: getFormattedMessage("digital-sales.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            response &&
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.ERROR,
                    })
                );
        });
};

export const fetchDigitalSaleDetails =
    (saleId, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            await apiConfig
                .get(apiBaseURL.DIGITAL_SALES + "/" + saleId)
                .then((response) => {
                    dispatch({
                        type: digitalSaleActionType.FETCH_DIGITAL_SALE_DETAILS,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };
