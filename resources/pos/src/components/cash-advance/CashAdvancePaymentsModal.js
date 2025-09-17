import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import moment from "moment";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { getFormattedMessage, placeholderText, currencySymbolHandling } from "../../shared/sharedMethod";
import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType } from "../../constants";
import { addToast } from "../../store/action/toastAction";
import { connect } from "react-redux";
import { setSavingButton } from "../../store/action/saveButtonAction";

const CashAdvancePaymentsModal = (props) => {
    const {
        show,
        onHide,
        cashAdvance,
        dispatch,
        frontSetting,
        allConfigData,
        onPaymentSuccess,
    } = props;

    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({ total_paid: 0, outstanding: 0 });
    const [form, setForm] = useState({
        paid_on: new Date(),
        amount: "",
        notes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (show && cashAdvance) {
            fetchPayments();
        }
    }, [show, cashAdvance?.id]);

    const resolveErrorMessage = (error) =>
        error?.response?.data?.message || error?.message || null;

    const fetchPayments = () => {
        apiConfig
            .get(`${apiBaseURL.CASH_ADVANCES}/${cashAdvance.id}/payments`)
            .then((response) => {
                setPayments(response.data.data || []);
                setSummary(response.data.summary || { total_paid: 0, outstanding: 0 });
            })
            .catch((error) => {
                const message = resolveErrorMessage(error);

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

    const onDateChange = (date) => {
        setForm((prev) => ({ ...prev, paid_on: date }));
    };

    const onInputChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            paid_on: new Date(),
            amount: "",
            notes: "",
        });
    };

    const submitPayment = (event) => {
        event.preventDefault();
        if (!cashAdvance) {
            return;
        }
        setIsSubmitting(true);
        dispatch(setSavingButton(true));
        apiConfig
            .post(`${apiBaseURL.CASH_ADVANCES}/${cashAdvance.id}/payments`, {
                paid_on: moment(form.paid_on).format("YYYY-MM-DD"),
                amount: form.amount,
                notes: form.notes,
            })
            .then((response) => {
                resetForm();
                fetchPayments();
                if (onPaymentSuccess) {
                    onPaymentSuccess(response.data);
                }
                dispatch(
                    addToast({
                        text: getFormattedMessage("cash-advance.payment.success"),
                    })
                );
            })
            .catch((error) => {
                const message = resolveErrorMessage(error);

                if (!message) {
                    return;
                }

                dispatch(
                    addToast({
                        text: message,
                        type: toastType.ERROR,
                    })
                );
            })
            .finally(() => {
                setIsSubmitting(false);
                dispatch(setSavingButton(false));
            });
    };

    const currencySymbol =
        frontSetting?.value && frontSetting.value.currency_symbol
            ? frontSetting.value.currency_symbol
            : "";

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Form onSubmit={submitPayment}>
                <Modal.Header closeButton>
                    <Modal.Title>{getFormattedMessage("cash-advance.payment.modal.title")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="border rounded p-3 bg-light">
                                <div className="fw-bold">
                                    {getFormattedMessage("cash-advance.table.recipient")}
                                </div>
                                <div>{cashAdvance?.issued_to_name}</div>
                                <div className="small text-muted">
                                    {cashAdvance?.reference_code}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border rounded p-3 bg-light">
                                <div className="fw-bold">
                                    {getFormattedMessage("cash-advance.summary.total-paid")}
                                </div>
                                <div>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        summary.total_paid || 0
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border rounded p-3 bg-light">
                                <div className="fw-bold">
                                    {getFormattedMessage("cash-advance.summary.outstanding")}
                                </div>
                                <div>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        summary.outstanding || 0
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-3 align-items-end mb-4">
                        <div className="col-md-4">
                            <label className="form-label">
                                {getFormattedMessage("react-data-table.date.column.label")}
                            </label>
                            <ReactDatePicker
                                onChangeDate={onDateChange}
                                newStartDate={form.paid_on}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">
                                {getFormattedMessage("amount.title")}
                            </label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    min="0"
                                    step="0.01"
                                    className="form-control"
                                    placeholder={placeholderText("cash-advance.payment.amount.placeholder")}
                                    onChange={onInputChange}
                                    required
                                />
                                <span className="input-group-text">{currencySymbol}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance.input.notes.label")}
                            </label>
                            <input
                                type="text"
                                name="notes"
                                value={form.notes}
                                className="form-control"
                                placeholder={placeholderText("cash-advance.payment.note.placeholder")}
                                onChange={onInputChange}
                            />
                        </div>
                    </div>
                    <div className="table-responsive border rounded">
                        <Table className="mb-0">
                            <thead>
                                <tr>
                                    <th>{getFormattedMessage("react-data-table.date.column.label")}</th>
                                    <th>{getFormattedMessage("amount.title")}</th>
                                    <th>{getFormattedMessage("cash-advance.table.notes")}</th>
                                    <th>{getFormattedMessage("cash-advance.table.recorded-by")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments?.length ? (
                                    payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{moment(payment.attributes?.paid_on).format("LL")}</td>
                                            <td>
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    currencySymbol,
                                                    payment.attributes?.amount
                                                )}
                                            </td>
                                            <td>{payment.attributes?.notes || "-"}</td>
                                            <td>{payment.attributes?.recorded_by_name || "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-3">
                                            {getFormattedMessage("react-data-table.no-record-found.label")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        {getFormattedMessage("globally.cancel-btn")}
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting
                            ? getFormattedMessage("globally.loading.label")
                            : getFormattedMessage("cash-advance.payment.submit")}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

const mapStateToProps = (state) => {
    const { frontSetting, allConfigData } = state;
    return { frontSetting, allConfigData };
};

export default connect(mapStateToProps)(CashAdvancePaymentsModal);
