import apiConfig from "../../config/apiConfig";
import { handleApiError } from "../../shared/utils/errorHandler";
import { addToast } from "./toastAction";
import { toastType } from "../../constants";

export const digitalProductActionType = {
    FETCH_DIGITAL_PRODUCTS: "FETCH_DIGITAL_PRODUCTS",
    FETCH_DIGITAL_PRODUCT: "FETCH_DIGITAL_PRODUCT",
    CLEAR_DIGITAL_PRODUCT: "CLEAR_DIGITAL_PRODUCT",
    ADD_DIGITAL_PRODUCT: "ADD_DIGITAL_PRODUCT",
    EDIT_DIGITAL_PRODUCT: "EDIT_DIGITAL_PRODUCT",
    DELETE_DIGITAL_PRODUCT: "DELETE_DIGITAL_PRODUCT",
    FETCH_ALL_DIGITAL_PRODUCTS: "FETCH_ALL_DIGITAL_PRODUCTS",
    FETCH_ACTIVE_DIGITAL_PRODUCTS: "FETCH_ACTIVE_DIGITAL_PRODUCTS",
    FETCH_DIGITAL_PRODUCTS_BY_CATEGORY: "FETCH_DIGITAL_PRODUCTS_BY_CATEGORY",
};

export const fetchDigitalProducts = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch({ type: "SET_LOADING", payload: true });
    }

    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page);
    if (filter.pageSize) params.append("pageSize", filter.pageSize);
    if (filter.category) params.append("category", filter.category);
    if (filter.is_active !== undefined) params.append("is_active", filter.is_active);

    const query = params.toString();
    const url = query ? `digital-products?${query}` : "digital-products";

    try {
        console.log('fetchDigitalProducts - fetching products with filter:', filter);
        const response = await apiConfig.get(url);
        console.log('fetchDigitalProducts - response:', response);
        console.log('fetchDigitalProducts - response.data:', response.data);

        // Handle different response structures
        let payloadData = response.data;
        if (response.data && response.data.data) {
            payloadData = response.data;
        }

        console.log('fetchDigitalProducts - final payload:', payloadData);

        dispatch({
            type: digitalProductActionType.FETCH_DIGITAL_PRODUCTS,
            payload: payloadData,
        });
    } catch (error) {
        console.error('fetchDigitalProducts - error:', error);
        console.error('fetchDigitalProducts - error response:', error.response?.data);
        const standardizedError = handleApiError(error, "Fetch Digital Products");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital products",
                type: toastType.ERROR,
            })
        );
    } finally {
        if (isLoading) {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }
};

export const fetchDigitalProduct = (id) => async (dispatch) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
        console.log('fetchDigitalProduct - fetching product with ID:', id);
        const response = await apiConfig.get(`digital-products/${id}`);
        console.log('fetchDigitalProduct - API response:', response);
        console.log('fetchDigitalProduct - response.data:', response.data);
        console.log('fetchDigitalProduct - response.data type:', typeof response.data);
        console.log('fetchDigitalProduct - response.data keys:', response.data ? Object.keys(response.data) : 'null');

        dispatch({
            type: digitalProductActionType.FETCH_DIGITAL_PRODUCT,
            payload: response.data,
        });

        console.log('fetchDigitalProduct - dispatched FETCH_DIGITAL_PRODUCT action');
    } catch (error) {
        console.error('fetchDigitalProduct - error:', error);
        console.error('fetchDigitalProduct - error response:', error.response?.data);
        const standardizedError = handleApiError(error, `Fetch Digital Product ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital product",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_LOADING", payload: false });
    }
};

export const clearDigitalProduct = () => (dispatch) => {
    console.log('clearDigitalProduct - clearing digital product data');
    dispatch({
        type: digitalProductActionType.CLEAR_DIGITAL_PRODUCT,
    });
};

export const addDigitalProduct = (digitalProduct, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.post("digital-products", digitalProduct);
        dispatch({
            type: digitalProductActionType.ADD_DIGITAL_PRODUCT,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital product created successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-products");
    } catch (error) {
        const standardizedError = handleApiError(error, "Create Digital Product");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to create digital product",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const editDigitalProduct = (id, digitalProduct, navigate) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        const response = await apiConfig.put(`digital-products/${id}`, digitalProduct);
        dispatch({
            type: digitalProductActionType.EDIT_DIGITAL_PRODUCT,
            payload: response.data,
        });
        dispatch(
            addToast({
                text: "Digital product updated successfully",
                type: toastType.SUCCESS,
            })
        );
        navigate("/user/digital/digital-products");
    } catch (error) {
        const standardizedError = handleApiError(error, `Update Digital Product ID: ${id}`);
        console.error('editDigitalProduct - error:', error);
        console.error('editDigitalProduct - error response:', error.response?.data);
        console.error('editDigitalProduct - request data:', digitalProduct);
        console.error('editDigitalProduct - validation errors:', error.response?.data?.errors);

        // Log specific validation errors if available
        if (error.response?.data?.errors) {
            console.error('editDigitalProduct - Detailed validation errors:');
            Object.keys(error.response.data.errors).forEach(field => {
                console.error(`  ${field}: ${error.response.data.errors[field].join(', ')}`);
            });
        }

        // Show specific validation errors if available
        let errorMessage = standardizedError.message || "Failed to update digital product";

        if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            const errorFields = Object.keys(validationErrors);
            if (errorFields.length > 0) {
                // Show all validation errors for better debugging
                const allErrors = errorFields.map(field => {
                    const fieldErrors = validationErrors[field];
                    return `${field}: ${fieldErrors.join(', ')}`;
                });
                errorMessage = `Validation failed: ${allErrors.join('; ')}`;
            }
        }

        // Handle specific error cases
        if (error.response?.status === 422) {
            if (error.response?.data?.message === 'Validation failed') {
                errorMessage = "Data tidak valid. Periksa kembali form Anda.";
            }
        } else if (error.response?.status === 404) {
            errorMessage = "Produk tidak ditemukan. Produk mungkin sudah dihapus.";
        } else if (error.response?.status >= 500) {
            errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
        }

        dispatch(
            addToast({
                text: errorMessage,
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const deleteDigitalProduct = (id) => async (dispatch) => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
        await apiConfig.delete(`digital-products/${id}`);
        dispatch({
            type: digitalProductActionType.DELETE_DIGITAL_PRODUCT,
            payload: id,
        });
        dispatch(
            addToast({
                text: "Digital product deleted successfully",
                type: toastType.SUCCESS,
            })
        );
    } catch (error) {
        const standardizedError = handleApiError(error, `Delete Digital Product ID: ${id}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to delete digital product",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch({ type: "SET_SAVING", payload: false });
    }
};

export const fetchAllDigitalProducts = () => async (dispatch) => {
    try {
        const response = await apiConfig.get("digital-products");
        dispatch({
            type: digitalProductActionType.FETCH_ALL_DIGITAL_PRODUCTS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch All Digital Products");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch all digital products",
                type: toastType.ERROR,
            })
        );
    }
};

export const fetchActiveDigitalProducts = () => async (dispatch) => {
    try {
        const response = await apiConfig.get("digital-products/active");
        dispatch({
            type: digitalProductActionType.FETCH_ACTIVE_DIGITAL_PRODUCTS,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, "Fetch Active Digital Products");
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch active digital products",
                type: toastType.ERROR,
            })
        );
    }
};

export const fetchDigitalProductsByCategory = (category) => async (dispatch) => {
    try {
        const response = await apiConfig.get(`digital-products/category/${category}`);
        dispatch({
            type: digitalProductActionType.FETCH_DIGITAL_PRODUCTS_BY_CATEGORY,
            payload: response.data,
        });
    } catch (error) {
        const standardizedError = handleApiError(error, `Fetch Digital Products By Category: ${category}`);
        dispatch(
            addToast({
                text: standardizedError.message || "Failed to fetch digital products by category",
                type: toastType.ERROR,
            })
        );
    }
};
