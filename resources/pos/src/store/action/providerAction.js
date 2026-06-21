import apiConfig from "../../config/apiConfigWthFormData";
import { apiBaseURL, providerActionType, toastType } from "../../constants";
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

export const fetchProviders =
    (filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.PROVIDERS;
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
                        type: providerActionType.FETCH_PROVIDERS,
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
                    let errorMessage = 'An error occurred while fetching providers';

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

export const fetchProvider =
    (providerId, isLoading = true) =>
        async (dispatch) => {
            console.log('Redux Action: fetchProvider called with ID:', providerId);
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.PROVIDERS + "/" + providerId)
                .then((response) => {
                    console.log('Redux Action: fetchProvider success:', response.data);
                    dispatch({
                        type: providerActionType.FETCH_PROVIDER,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    console.error('Redux Action: fetchProvider error:', response);

                    let errorMessage = 'An error occurred while fetching provider';

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

export const addProvider = (provider, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));

    // Debug: Log the FormData being sent
    console.log('API Action - Sending provider data:');
    for (let [key, value] of provider.entries()) {
        console.log(key, value);
    }

    await apiConfig
        .post(apiBaseURL.PROVIDERS, provider)
        .then((response) => {
            console.log('API Response - Success:', response.data);
            dispatch({
                type: providerActionType.ADD_PROVIDER,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("provider.success.create.message"),
                })
            );
            navigate("/user/providers");
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            console.error('API Response - Error:', response);
            dispatch(setSavingButton(false));

            let errorMessage = 'An error occurred while creating provider';

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

export const editProvider =
    (providerId, provider, navigate) => async (dispatch) => {
        dispatch(setSavingButton(true));
        apiConfig
            .post(apiBaseURL.PROVIDERS + "/" + providerId, provider)
            .then((response) => {
                dispatch({
                    type: providerActionType.EDIT_PROVIDER,
                    payload: response.data.data,
                });
                navigate("/user/providers");
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "provider.success.edit.message"
                        ),
                    })
                );
                dispatch(setSavingButton(false));
            })
            .catch(({ response }) => {
                dispatch(setSavingButton(false));

                let errorMessage = 'An error occurred while updating provider';

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

export const deleteProvider = (providerId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.PROVIDERS + "/" + providerId)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: providerActionType.DELETE_PROVIDER,
                payload: providerId,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("provider.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            let errorMessage = 'An error occurred while deleting provider';

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