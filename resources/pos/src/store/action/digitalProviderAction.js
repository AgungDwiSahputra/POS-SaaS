import apiConfig from "../../config/apiConfig";
import { addToast } from "./toastAction";
import { toastType } from "../../constants";
import { handleApiError } from "../../shared/utils/errorHandler";

const getRequestConfig = (payload) =>
    payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

export const digitalProviderActionType = {
    FETCH_DIGITAL_PROVIDERS: "FETCH_DIGITAL_PROVIDERS",
    FETCH_DIGITAL_PROVIDER: "FETCH_DIGITAL_PROVIDER",
    ADD_DIGITAL_PROVIDER: "ADD_DIGITAL_PROVIDER",
    EDIT_DIGITAL_PROVIDER: "EDIT_DIGITAL_PROVIDER",
    DELETE_DIGITAL_PROVIDER: "DELETE_DIGITAL_PROVIDER",
    FETCH_ALL_DIGITAL_PROVIDERS: "FETCH_ALL_DIGITAL_PROVIDERS",
    FETCH_ACTIVE_DIGITAL_PROVIDERS: "FETCH_ACTIVE_DIGITAL_PROVIDERS",
};

export const fetchDigitalProviders = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch({ type: "SET_LOADING", payload: true });
    }

    let url = "digital-providers";

    if (filter.page) {
        url += "?page=" + filter.page;
    }

    if (filter.pageSize) {
        url += "&pageSize=" + filter.pageSize;
    }

    try {
        const response = await apiConfig.get(url);
        dispatch({
            type: digitalProviderActionType.FETCH_DIGITAL_PROVIDERS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, 'Fetch Digital Providers');
        dispatch(
            addToast({
                text: `Gagal mengambil data provider digital: ${standardizedError.message}`,
                type: toastType.ERROR,
            })
        );
    } finally {
        if (isLoading) {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }
};

export const fetchDigitalProvider = (id) => async (dispatch) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
        const response = await apiConfig.get(`digital-providers/${id}`);
        dispatch({
            type: digitalProviderActionType.FETCH_DIGITAL_PROVIDER,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Provider ID: ${id}`);
        dispatch(
            addToast({
                text: `Gagal mengambil detail provider: ${standardizedError.message}`,
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_LOADING", payload: false });
    }
};

export const addDigitalProvider = (digitalProvider, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post(
            "digital-providers",
            digitalProvider,
            getRequestConfig(digitalProvider)
        );
        dispatch({
            type: digitalProviderActionType.ADD_DIGITAL_PROVIDER,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital provider created successfully",
                type: toastType.SUCCESS,
            })
        );
        if (navigate) {
            navigate("/user/digital/digital-providers");
        }
    } catch (error) {
        const standardizedError = handleApiError(error, 'Create Digital Provider');
        dispatch(
            addToast({
                text: `Gagal membuat provider digital: ${standardizedError.message}`,
                type: toastType.ERROR,
            })
        );
        throw standardizedError;
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const editDigitalProvider = (id, digitalProvider, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        let response;
        if (digitalProvider instanceof FormData) {
            digitalProvider.append("_method", "PUT");
            response = await apiConfig.post(
                `digital-providers/${id}`,
                digitalProvider,
                getRequestConfig(digitalProvider)
            );
        } else {
            response = await apiConfig.put(`digital-providers/${id}`, digitalProvider);
        }
        dispatch({
            type: digitalProviderActionType.EDIT_DIGITAL_PROVIDER,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital provider updated successfully",
                type: toastType.SUCCESS,
            })
        );
        if (navigate) {
            navigate("/user/digital/digital-providers");
        }
    } catch (error) {
        const standardizedError = handleApiError(error, `Update Digital Provider ID: ${id}`);
        dispatch(
            addToast({
                text: `Gagal mengupdate provider digital: ${standardizedError.message}`,
                type: toastType.ERROR,
            })
        );
        throw standardizedError;
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const deleteDigitalProvider = (id) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        await apiConfig.delete(`digital-providers/${id}`);
        dispatch({
            type: digitalProviderActionType.DELETE_DIGITAL_PROVIDER,
            payload: id,
        });
        dispatch(
            addToast({
                text: "Digital provider deleted successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Delete Digital Provider ID: ${id}`);
        dispatch(
            addToast({
                text: `Gagal menghapus provider digital: ${standardizedError.message}`,
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const fetchAllDigitalProviders = () => async (dispatch) => {
    try {
        const response = await apiConfig.get("digital-providers");
        dispatch({
            type: digitalProviderActionType.FETCH_ALL_DIGITAL_PROVIDERS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, 'Fetch All Digital Providers');
        dispatch(
            addToast({
                text: `Gagal mengambil semua provider digital: ${standardizedError.message}`,
                type: toastType.ERROR,
            })
        );
    }
};

export const fetchActiveDigitalProviders = () => async (dispatch) => {
    try {
        const response = await apiConfig.get("digital-providers/active");
        const responseData = response?.data;

        if (!response || responseData === undefined || responseData === null) {
            throw new Error("Response data tidak tersedia");
        }

        let providers = [];

        if (Array.isArray(responseData)) {
            providers = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
            providers = responseData.data;
        } else if (responseData?.providers && Array.isArray(responseData.providers)) {
            providers = responseData.providers;
        }

        dispatch({
            type: digitalProviderActionType.FETCH_ACTIVE_DIGITAL_PROVIDERS,
            payload: providers,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, 'Fetch Active Digital Providers');

        const status = error?.response?.status;
        const isNotFound = status === 404;

        if (!isNotFound) {
            dispatch(addToast({
                text: `Gagal mengambil provider aktif: ${standardizedError.message}`,
                type: toastType.ERROR,
            }));
        }

        dispatch({
            type: digitalProviderActionType.FETCH_ACTIVE_DIGITAL_PROVIDERS,
            payload: [],
        });
    }
};
