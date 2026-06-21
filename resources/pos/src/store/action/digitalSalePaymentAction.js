import { setLoading } from "./loadingAction";
import apiConfig from "../../config/apiConfig";
import { apiBaseURL, digitalSaleActionType, toastType } from "../../constants";
import { addToast } from "./toastAction";
import { getFormattedMessage } from "../../shared/sharedMethod";

export const createDigitalSalePayment =
    (salePayment, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .post(
                    apiBaseURL.DIGITAL_SALES +
                        "/" +
                        salePayment.sale_id +
                        "/capture-payment",
                    salePayment
                )
                .then((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: getFormattedMessage(
                                "digital-sale.payment.create.success"
                            ),
                        })
                    );
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

export const fetchDigitalSalePayments =
    (sale_id, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.DIGITAL_SALES + "/" + sale_id + "/payments")
                .then((response) => {
                    dispatch({
                        type: digitalSaleActionType.FETCH_DIGITAL_SALE_PAYMENT,
                        payload: response.data.data,
                    });
                })
                .catch((response) => {
                    dispatch(
                        addToast({
                            text: response?.response?.data?.message,
                            type: toastType.ERROR,
                        })
                    );
                })
                .finally(() => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                });
        };

export const editDigitalSalePayment =
    (details, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .post(
                    apiBaseURL.DIGITAL_SALES + "/" + details.payment_id + "/payment",
                    details
                )
                .then((response) => {
                    dispatch(
                        addToast({
                            text: getFormattedMessage("digital-sale.payment.edit.success"),
                        })
                    );
                    const data = response.data.data.attributes;
                    const newData = Object.assign(data, {
                        id: response.data.data.id,
                    });
                    newData &&
                        dispatch({
                            type: digitalSaleActionType.EDIT_DIGITAL_SALE_PAYMENT,
                            payload: newData,
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

export const deleteDigitalSalePayment =
    (paymentId, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .delete(apiBaseURL.DIGITAL_SALES + "/" + paymentId + "/payment")
                .then((response) => {
                    dispatch({
                        type: digitalSaleActionType.DELETE_DIGITAL_SALE_PAYMENT,
                        payload: paymentId,
                    });
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                        })
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
