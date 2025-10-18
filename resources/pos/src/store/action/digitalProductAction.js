import apiConfig from "../../config/apiConfigWthFormData";
import { apiBaseURL, digitalProductActionType, toastType } from "../../constants";
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

export const fetchDigitalProducts =
    (filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.DIGITAL_PRODUCTS;
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
                        type: digitalProductActionType.FETCH_DIGITAL_PRODUCTS,
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
                    let errorMessage = 'An error occurred while fetching digital products';

                    if (response?.data?.message) {
                        errorMessage = response.data.message;
                    } else if (response?.status === 401) {
                        errorMessage = 'Authentication required. Please log in again.';
                    } else if (response?.status >= 500) {
                        errorMessage = 'Server error. Please try again later.';
                    } else if (typeof response?.data === 'string' && response.data.includes('admin@infy-pos.com')) {
                        errorMessage = 'Server configuration error. Please contact administrator.';
                    }

                    dispatch(
                        addToast({
                            text: errorMessage,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const fetchDigitalProduct =
    (digitalProductId, isLoading = true) =>
        async (dispatch) => {
            console.log('Redux Action: fetchDigitalProduct called with ID:', digitalProductId);
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.DIGITAL_PRODUCTS + "/" + digitalProductId)
                .then((response) => {
                    console.log('Redux Action: fetchDigitalProduct success:', response.data);
                    dispatch({
                        type: digitalProductActionType.FETCH_DIGITAL_PRODUCT,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    console.error('Redux Action: fetchDigitalProduct error:', response);

                    let errorMessage = 'An error occurred while fetching digital product';

                    if (response?.data?.message) {
                        errorMessage = response.data.message;
                    } else if (response?.status === 401) {
                        errorMessage = 'Authentication required. Please log in again.';
                    } else if (response?.status >= 500) {
                        errorMessage = 'Server error. Please try again later.';
                    } else if (typeof response?.data === 'string' && response.data.includes('admin@infy-pos.com')) {
                        errorMessage = 'Server configuration error. Please contact administrator.';
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

export const addDigitalProduct = (digitalProduct, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));

    // Debug: Log the FormData being sent
    console.log('API Action - Sending digital product data:');
    for (let [key, value] of digitalProduct.entries()) {
        console.log(key, value);
    }

    await apiConfig
        .post(apiBaseURL.DIGITAL_PRODUCTS, digitalProduct)
        .then((response) => {
            console.log('API Response - Success:', response.data);
            dispatch({
                type: digitalProductActionType.ADD_DIGITAL_PRODUCT,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("digital-product.success.create.message"),
                })
            );
            navigate("/user/digital-products");
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            console.error('API Response - Error:', response);
            dispatch(setSavingButton(false));

            let errorMessage = 'An error occurred while creating digital product';

            if (response?.data?.message) {
                errorMessage = response.data.message;
            } else if (response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (typeof response?.data === 'string' && response.data.includes('admin@infy-pos.com')) {
                errorMessage = 'Server configuration error. Please contact administrator.';
            } else if (!response?.data?.message) {
                errorMessage = 'Unknown error occurred';
            }

            dispatch(
                addToast({
                    text: errorMessage,
                    type: toastType.ERROR
                })
            );
        });
};

export const editDigitalProduct =
    (digitalProductId, digitalProduct, navigate) => async (dispatch) => {
        dispatch(setSavingButton(true));
        apiConfig
            .post(apiBaseURL.DIGITAL_PRODUCTS + "/" + digitalProductId, digitalProduct)
            .then((response) => {
                dispatch({
                    type: digitalProductActionType.EDIT_DIGITAL_PRODUCT,
                    payload: response.data.data,
                });
                navigate("/user/digital-products");
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "digital-product.success.edit.message"
                        ),
                    })
                );
                dispatch(setSavingButton(false));
            })
            .catch(({ response }) => {
                dispatch(setSavingButton(false));

                let errorMessage = 'An error occurred while updating digital product';

                if (response?.data?.message) {
                    errorMessage = response.data.message;
                } else if (response?.status === 401) {
                    errorMessage = 'Authentication required. Please log in again.';
                } else if (response?.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (typeof response?.data === 'string' && response.data.includes('admin@infy-pos.com')) {
                    errorMessage = 'Server configuration error. Please contact administrator.';
                }

                dispatch(
                    addToast({
                        text: errorMessage,
                        type: toastType.ERROR,
                    })
                );
            });
    };

export const deleteDigitalProduct = (digitalProductId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.DIGITAL_PRODUCTS + "/" + digitalProductId)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: digitalProductActionType.DELETE_DIGITAL_PRODUCT,
                payload: digitalProductId,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("digital-product.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            let errorMessage = 'An error occurred while deleting digital product';

            if (response?.data?.message) {
                errorMessage = response.data.message;
            } else if (response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (typeof response?.data === 'string' && response.data.includes('admin@infy-pos.com')) {
                errorMessage = 'Server configuration error. Please contact administrator.';
            }

            dispatch(
                addToast({ text: errorMessage, type: toastType.ERROR })
            );
        });
};