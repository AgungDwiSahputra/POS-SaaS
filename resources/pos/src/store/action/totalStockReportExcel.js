import apiConfig from '../../config/apiConfig';
import {setLoading} from './loadingAction';

export const totalStockReportExcel = (warehouse, filter = {}, isLoading = true, setIsWarehouseValue) => async (dispatch) => {
    // Validate warehouse ID
    if (!warehouse) {
        console.error('Warehouse ID is required for stock report Excel export');
        if (setIsWarehouseValue) {
            setIsWarehouseValue(false);
        }
        return;
    }

    if (isLoading) {
        dispatch(setLoading(true))
    }
    
    await apiConfig.get(`stock-report-excel?warehouse_id=${warehouse}`)
        .then((response) => {
            if (response?.data?.data?.stock_report_excel_url) {
                window.open(response.data.data.stock_report_excel_url, '_blank');
            } else {
                console.error('Invalid response format for Excel export');
            }
            if (setIsWarehouseValue) {
                setIsWarehouseValue(false);
            }
        })
        .catch((error) => {
            console.error('Error exporting stock report to Excel:', error);
            // You could add a toast notification here
            if (setIsWarehouseValue) {
                setIsWarehouseValue(false);
            }
        })
        .finally(() => {
            if (isLoading) {
                dispatch(setLoading(false))
            }
        });
};
