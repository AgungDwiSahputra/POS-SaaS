import apiConfig from "../../config/apiConfig";
import { apiBaseURL, cashAdvanceReportActionType, toastType } from "../../constants";
import requestParam from "../../shared/requestParam";
import { addToast } from "./toastAction";
import { setLoading } from "./loadingAction";

const resolveReportErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || null;

export const fetchCashAdvanceReport =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = apiBaseURL.CASH_ADVANCE_REPORT;
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
                    type: cashAdvanceReportActionType.FETCH_CASH_ADVANCE_REPORT,
                    payload: response.data,
                });
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            })
            .catch((error) => {
                if (isLoading) {
                    dispatch(setLoading(false));
                }

                const message = resolveReportErrorMessage(error);

                if (!message) {
                    return;
                }

                dispatch(
                    addToast({
                        text: message,
                        type: toastType.ERROR,
                    })
                );
            });
    };
