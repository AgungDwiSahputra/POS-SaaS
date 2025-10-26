import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Navigate } from "react-router-dom";
import { discountType, frequencies, paymentMethods, Tokens } from "../constants";
import moment from "moment";
import { calculateSubTotal } from "./calculation/calculation";

export const getAvatarName = (name) => {
    if (name) {
        return name
            .toLowerCase()
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase())
            .join("").slice(0, 2);
    }
};

export const numValidate = (event) => {
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
};

export const numWithSpaceValidate = (event) => {
        if (!/[0-9]/.test(event.key) && event.key !== ' ') {
            event.preventDefault();
        }
};


export const numFloatValidate = (event) => {
    const key = event.key;
    const value = event.target.value;
    if (/[0-9]/.test(key)) {
        return;
    }
    if (key === '.' && !value.includes('.')) {
        return;
    }
    event.preventDefault();
};


export const getFormattedMessage = (id, defaultText = null) => {
    if (!id) return "";
    return <FormattedMessage id={id} defaultMessage={defaultText ?? id} />;
};

export const getFormattedOptions = (options) => {
    const intl = useIntl();
    const copyOptions = _.cloneDeep(options);
    copyOptions.map(
        (option) =>
            (option.name = intl.formatMessage({
                id: option.name,
                defaultMessage: option.name,
            }))
    );
    return copyOptions;
};

export const placeholderText = (label) => {
    if (!label) return "";
    const intl = useIntl();
    const placeholderLabel = intl.formatMessage({ id: label });
    return placeholderLabel;
};

export const decimalValidate = (event) => {
    if (!/^\d*\.?\d*$/.test(event.key)) {
        event.preventDefault();
    }
};

export const addRTLSupport = (rtlLang) => {
    const html = document.getElementsByTagName("html")[0];
    const att = document.createAttribute("dir");
    att.value = "rtl";
    if (rtlLang === "ar") {
        html.setAttributeNode(att);
    } else {
        html.removeAttribute("dir");
    }
};

export const onFocusInput = (el) => {
    if (el.target.value === "0.00") {
        el.target.value = "";
    }
};

export const ProtectedRoute = (props) => {
    const { children, allConfigData, route } = props;
    const token = localStorage.getItem(Tokens.ADMIN);
    if (!token || token === null) {
        return <Navigate to="/login" replace={true} />;
    } else {
        return children;
    }
};

export const formatAmount = (num) => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num;
};

export const smartToFixed = (num, decimals = 2) => {
    const fixed = parseFloat(num).toFixed(decimals);
    // If decimals is 2 and the number ends with .00, remove it
    if (decimals === 2 && fixed.endsWith('.00')) {
        return fixed.slice(0, -3);
    }
    return fixed;
};

export const currencySymbolHandling = (
    isRightside,
    currency,
    value,
    is_forment
) => {
    if (isRightside?.is_currency_right === "true") {
        if (is_forment) {
            return formatAmount(value) + " " + currency;
        } else {
            return smartToFixed(value, 2) + " " + currency;
        }
    } else {
        if (is_forment) {
            return currency + " " + formatAmount(value);
        } else {
            return currency + " " + smartToFixed(value, 2);
        }
    }
};

export const getFormattedDate = (date, config) => {
    const format = config && config.date_format;
    if (format === "d-m-y") {
        return moment(date).format("DD-MM-YYYY");
    } else if (format === "m-d-y") {
        return moment(date).format("MM-DD-YYYY");
    } else if (format === "y-m-d") {
        return moment(date).format("YYYY-MM-DD");
    } else if (format === "m/d/y") {
        return moment(date).format("MM/DD/YYYY");
    } else if (format === "d/m/y") {
        return moment(date).format("DD/MM/YYYY");
    } else if (format === "y/m/d") {
        return moment(date).format("YYYY/MM/DD");
    } else if (format === "m.d.y") {
        return moment(date).format("MM.DD.YYYY");
    } else if (format === "d.m.y") {
        return moment(date).format("DD.MM.YYYY");
    } else if (format === "y.m.d") {
        return moment(date).format("YYYY.MM.DD");
    } else {
        return moment(date).format("YYYY-MM-DD");
    };
};

export const getFrequency = (frequency) => {
    if (!frequency) {
        return null;
    }
    const result = frequencies.find((f) => f.id == frequency);
    return result ? result.name : null;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('Do MMM, YYYY');
};

export const getPaymentMethodName = (paymentType) => {
    const result = paymentMethods.find((f) => f.id == paymentType);
    return result ? result.name : null;
};

export const generateBarCode = () => {
    const randomPart = Math.random().toString(36).slice(2).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const finalLength = Math.floor(Math.random() * 5) + 8;
    const finalCode = randomPart.slice(0, finalLength);
    return finalCode;
};

export const calculateMainAmounts = (updateProducts, inputValues) => {
    const subTotal = calculateSubTotal(updateProducts);
    const discountRaw = parseFloat(inputValues.discount_value) || 0;

    const discountAmount =
        inputValues.discount_type === discountType.PERCENTAGE
            ? (subTotal * discountRaw) / 100
            : discountRaw;

    const totalAmountAfterDiscount = subTotal - discountAmount;

    const taxRate = parseFloat(inputValues.tax_rate) || 0;
    const taxCal = ((totalAmountAfterDiscount * taxRate) / 100).toFixed(2);

    return {
        subTotal,
        discountRaw,
        discountAmount,
        totalAmountAfterDiscount,
        taxRate,
        taxCal,
    };
};

export const getPermission = (allPermissions, permission) => {
    const getPermission = allPermissions && allPermissions.find((item) => item === permission);
    return getPermission ? true : false;
};

export const paymentMethodName = (paymentMethods, updateProducts) => {
    const paymentMethodType = paymentMethods?.length > 0 && paymentMethods?.filter((payment_type) => payment_type.id === updateProducts.payment_type);
    const paymentMethodTypeName = paymentMethodType[0] && paymentMethodType[0].attributes && paymentMethodType[0].attributes.name;
    return paymentMethodTypeName;
}

/**
 * Safely parse JSON from localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if parsing fails or key doesn't exist
 * @returns {any} - Parsed data or default value
 */
export const safeParseLocalStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return defaultValue;
    }
};

/**
 * Get current user data from localStorage with fallback handling
 * @returns {object|null} - User object or null if not available
 */
export const getCurrentUser = () => {
    // Try to get complete user object from loginUserArray first
    const userFromLoginArray = safeParseLocalStorage('loginUserArray', null);
    if (userFromLoginArray) {
        return userFromLoginArray;
    }
    
    // If loginUserArray is not available, try to construct user object from individual fields
    try {
        const firstName = localStorage.getItem(Tokens.FIRST_NAME);
        const lastName = localStorage.getItem(Tokens.LAST_NAME);
        const email = localStorage.getItem(Tokens.USER);
        const image = localStorage.getItem(Tokens.IMAGE);
        const language = localStorage.getItem(Tokens.LANGUAGE);
        
        if (email) {
            return {
                email,
                first_name: firstName,
                last_name: lastName,
                image_url: image,
                language
            };
        }
    } catch (error) {
        console.error('Error constructing user object from individual fields:', error);
    }
    
    return null;
};

/**
 * Validate if a value is a valid JSON string
 * @param {string} value - String to validate
 * @returns {boolean} - True if valid JSON, false otherwise
 */
export const isValidJSON = (value) => {
    if (typeof value !== 'string') {
        return false;
    }
    try {
        JSON.parse(value);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Safe JSON parsing with validation
 * @param {string} jsonString - String to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
    if (!isValidJSON(jsonString)) {
        return defaultValue;
    }
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
    }
};

/**
 * Handle image loading errors with fallback
 * @param {React.SyntheticEvent} e - The error event
 * @param {string} fallbackSrc - Fallback image source
 */
export const handleImageError = (e, fallbackSrc = null) => {
    e.target.onerror = null; // Prevent infinite loop
    if (fallbackSrc) {
        e.target.src = fallbackSrc;
    } else {
        // Use a default avatar or hide the image
        e.target.style.display = 'none';
        
        // Try to show a parent container with a default avatar
        const parent = e.target.parentElement;
        if (parent) {
            // Create a default avatar element
            const defaultAvatar = document.createElement('div');
            defaultAvatar.className = 'custom-user-avatar fs-5';
            defaultAvatar.textContent = 'U'; // Default avatar text
            
            // Replace the image with the default avatar
            parent.replaceChild(defaultAvatar, e.target);
        }
    }
};

/**
 * Get safe image URL with error handling
 * @param {string} imageUrl - The image URL to check
 * @returns {string|null} - Safe image URL or null
 */
export const getSafeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Check if the URL contains user_image path
    if (imageUrl.includes('user_image/')) {
        // For now, we'll return null to trigger fallback
        // In a real implementation, you might want to check if the file exists
        return null;
    }
    
    return imageUrl;
};
