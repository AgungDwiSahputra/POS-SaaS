import { setLoading } from "./loadingAction";
import { apiBaseURL, stockReportActionType } from "../../constants";
import apiConfig from "../../config/apiConfig";
import { setTotalRecord } from "./totalRecordAction";
import requestParam from "../../shared/requestParam";

export const stockReportAction =
    (id, filter = {}, isLoading = true) =>
    async (dispatch) => {
        // Validate warehouse ID
        if (!id) {
            console.error('Warehouse ID is required for stock report');
            if (isLoading) {
                dispatch(setLoading(false));
            }
            return;
        }

        if (isLoading) {
            dispatch(setLoading(true));
        }
        
        const stockReport = true;
        let url = apiBaseURL.STOCK_REPORT + "?warehouse_id=" + id;
        
        if (
            !_.isEmpty(filter) &&
            (filter.page ||
                filter.pageSize ||
                filter.search ||
                filter.order_By ||
                filter.created_at)
        ) {
            url += requestParam(filter, false, stockReport, null, url);
        }
        
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: stockReportActionType.STOCK_REPORT,
                    payload: response.data.data || [],
                });
                dispatch(
                    setTotalRecord(
                        response.data.meta?.total !== undefined &&
                            response.data.meta.total >= 0
                            ? response.data.meta.total
                            : (response.data.data?.length || 0)
                    )
                );
            })
            .catch((error) => {
                console.error('Error fetching stock report:', error);
                // Dispatch empty array on error to prevent undefined errors
                dispatch({
                    type: stockReportActionType.STOCK_REPORT,
                    payload: [],
                });
                dispatch(setTotalRecord(0));
            })
            .finally(() => {
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            });
    };
