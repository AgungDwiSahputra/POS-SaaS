import apiConfig from "../../config/apiConfig";
import { handleApiError } from "../../shared/utils/errorHandler";
import { addToast } from "./toastAction";
import { toastType } from "../../constants";

export const storeDigitalProviderActionType = {
    FETCH_STORE_DIGITAL_PROVIDERS: "FETCH_STORE_DIGITAL_PROVIDERS",
    FETCH_STORE_DIGITAL_PROVIDER: "FETCH_STORE_DIGITAL_PROVIDER",
    ADD_STORE_DIGITAL_PROVIDER: "ADD_STORE_DIGITAL_PROVIDER",
    EDIT_STORE_DIGITAL_PROVIDER: "EDIT_STORE_DIGITAL_PROVIDER",
    DELETE_STORE_DIGITAL_PROVIDER: "DELETE_STORE_DIGITAL_PROVIDER",
    FETCH_PROVIDERS_BY_STORE: "FETCH_PROVIDERS_BY_STORE",
    ADD_BALANCE: "ADD_BALANCE",
    GET_BALANCE: "GET_BALANCE",
};

export const fetchStoreDigitalProviders = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch({ type: "SET_LOADING", payload: true });
    }

    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page);
    if (filter.pageSize) params.append("pageSize", filter.pageSize);
    if (filter.store_id) params.append("store_id", filter.store_id);

    const query = params.toString();
    const url = query ? `store-digital-providers?${query}` : "store-digital-providers";

    try {
        console.log('fetchStoreDigitalProviders - fetching with filter:', filter);
        const response = await apiConfig.get(url);
        console.log('fetchStoreDigitalProviders - response:', response);
        console.log('fetchStoreDigitalProviders - response.data:', response.data);

        // Handle different response structures
        let payloadData = response.data;
        if (response.data && response.data.data) {
            payloadData = response.data;
        }

        console.log('fetchStoreDigitalProviders - final payload:', payloadData);

        dispatch({
            type: storeDigitalProviderActionType.FETCH_STORE_DIGITAL_PROVIDERS,
            payload: payloadData,
        });
    } catch (error) {
        console.error('fetchStoreDigitalProviders - error:', error);
        console.error('fetchStoreDigitalProviders - error response:', error.response?.data);
        const standardizedError = handleApiError(error, "Fetch Store Digital Providers");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch store digital providers",
                type: toastType.ERROR,
            })
        );
    } finally {
        if (isLoading) {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }
};

export const fetchProvidersByStore = (storeId) => async (dispatch) => {
    try {
        const response = await apiConfig.get(`store-digital-providers/store/${storeId}`);
        dispatch({
            type: storeDigitalProviderActionType.FETCH_PROVIDERS_BY_STORE,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Providers By Store: ${storeId}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch providers by store",
                type: toastType.ERROR,
            })
        );
    }
};

export const addBalance = (id, amount) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post(`store-digital-providers/${id}/add-balance`, {
            amount: amount
        });
        dispatch({
            type: storeDigitalProviderActionType.ADD_BALANCE,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Balance added successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Add Balance Store Digital Provider ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to add balance",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const getBalance = (storeId, providerId) => async (dispatch) => {
    try {
        const response = await apiConfig.get(`store-digital-providers/balance?store_id=${storeId}&digital_provider_id=${providerId}`);
        dispatch({
            type: storeDigitalProviderActionType.GET_BALANCE,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Get Balance Store: ${storeId}, Provider: ${providerId}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to get balance",
                type: toastType.ERROR,
            })
        );
    }
};

export const createStoreDigitalProvider = (storeProviderData) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post("store-digital-providers", storeProviderData);
        dispatch({
            type: storeDigitalProviderActionType.ADD_STORE_DIGITAL_PROVIDER,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Store digital provider created successfully",
                type: toastType.SUCCESS,
            })
        );
        return response.data;
    } catch (error) {
        const standardizedError = handleApiError(error, "Create Store Digital Provider");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to create store digital provider",
                type: toastType.ERROR,
            })
        );
        throw error;
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};
