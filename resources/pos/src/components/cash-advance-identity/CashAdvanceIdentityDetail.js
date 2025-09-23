import React, { useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCashAdvanceIdentityWithHistory } from "../../store/action/cashAdvanceIdentityAction";
import { getFormattedMessage, currencySymbolHandling } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Button } from "react-bootstrap-v5";
import moment from "moment";

const CashAdvanceIdentityDetail = (props) => {
    const { fetchCashAdvanceIdentityWithHistory, singleCashAdvanceIdentity, frontSetting } = props;
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchCashAdvanceIdentityWithHistory(id);
    }, []);

    const identity = singleCashAdvanceIdentity?.attributes;

    if (!identity) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <div className="card">
                    <div className="card-body text-center">
                        <p>{getFormattedMessage("cash-advance-identity.not.found")}</p>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("cash-advance-identity.detail.title")}
                to="/user/cash-advance-identities"
            />
            
            <div className="row">
                {/* Identity Information */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                {getFormattedMessage("cash-advance-identity.detail.information.title")}
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-sm-4">
                                    <strong>{getFormattedMessage("cash-advance-identity.input.name.label")}:</strong>
                                </div>
                                <div className="col-sm-8">{identity.name}</div>
                            </div>
                            
                            {identity.employee_id && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.employee_id.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{identity.employee_id}</div>
                                </div>
                            )}
                            
                            <div className="row mb-3">
                                <div className="col-sm-4">
                                    <strong>{getFormattedMessage("cash-advance-identity.input.type.label")}:</strong>
                                </div>
                                <div className="col-sm-8">
                                    <span className={`badge bg-${identity.type === 'employee' ? 'primary' : identity.type === 'contractor' ? 'warning' : 'secondary'}`}>
                                        {getFormattedMessage(`cash-advance-identity.type.${identity.type}`)}
                                    </span>
                                </div>
                            </div>
                            
                            {identity.department && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.department.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{identity.department}</div>
                                </div>
                            )}
                            
                            {identity.phone && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.phone.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{identity.phone}</div>
                                </div>
                            )}
                            
                            {identity.email && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.email.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{identity.email}</div>
                                </div>
                            )}
                            
                            {identity.date_of_birth && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.date_of_birth.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{moment(identity.date_of_birth).format('DD/MM/YYYY')}</div>
                                </div>
                            )}
                            
                            <div className="row mb-3">
                                <div className="col-sm-4">
                                    <strong>{getFormattedMessage("cash-advance-identity.input.status.label")}:</strong>
                                </div>
                                <div className="col-sm-8">
                                    <span className={`badge bg-${identity.is_active ? 'success' : 'danger'}`}>
                                        {getFormattedMessage(`cash-advance-identity.status.${identity.is_active ? 'active' : 'inactive'}`)}
                                    </span>
                                </div>
                            </div>
                            
                            {identity.address && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.address.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{identity.address}</div>
                                </div>
                            )}
                            
                            {identity.notes && (
                                <div className="row mb-3">
                                    <div className="col-sm-4">
                                        <strong>{getFormattedMessage("cash-advance-identity.input.notes.label")}:</strong>
                                    </div>
                                    <div className="col-sm-8">{identity.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                {getFormattedMessage("cash-advance-identity.detail.summary.title")}
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-sm-6">
                                    <strong>{getFormattedMessage("cash-advance-identity.summary.total_advances.label")}:</strong>
                                </div>
                                <div className="col-sm-6">
                                    <span className="badge bg-info fs-6">
                                        {identity.total_advances || 0}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="row mb-3">
                                <div className="col-sm-6">
                                    <strong>{getFormattedMessage("cash-advance-identity.summary.total_amount.label")}:</strong>
                                </div>
                                <div className="col-sm-6">
                                    <span className="fw-bold">
                                        {currencySymbolHandling(frontSetting?.value?.currency_symbol, identity.total_amount || 0)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="row mb-3">
                                <div className="col-sm-6">
                                    <strong>{getFormattedMessage("cash-advance-identity.summary.total_paid.label")}:</strong>
                                </div>
                                <div className="col-sm-6">
                                    <span className="fw-bold text-success">
                                        {currencySymbolHandling(frontSetting?.value?.currency_symbol, identity.total_paid || 0)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="row mb-3">
                                <div className="col-sm-6">
                                    <strong>{getFormattedMessage("cash-advance-identity.summary.outstanding.label")}:</strong>
                                </div>
                                <div className="col-sm-6">
                                    <span className={`fw-bold ${(identity.total_outstanding || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                                        {currencySymbolHandling(frontSetting?.value?.currency_symbol, identity.total_outstanding || 0)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <Button
                                    className="btn btn-primary me-2"
                                    onClick={() => navigate(`/user/cash-advance-identities/${id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    {getFormattedMessage("cash-advance-identity.edit.title")}
                                </Button>
                                
                                <Button
                                    className="btn btn-success"
                                    onClick={() => navigate(`/user/cash-advances/create?identity_id=${id}`)}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    {getFormattedMessage("cash-advance.create.title")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cash Advances History */}
            {singleCashAdvanceIdentity?.cash_advances && singleCashAdvanceIdentity.cash_advances.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h5 className="card-title mb-0">
                            {getFormattedMessage("cash-advance-identity.detail.history.title")}
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>{getFormattedMessage("react-data-table.date.column.label")}</th>
                                        <th>{getFormattedMessage("amount.title")}</th>
                                        <th>{getFormattedMessage("cash-advance.paid_amount.label")}</th>
                                        <th>{getFormattedMessage("cash-advance.outstanding_amount.label")}</th>
                                        <th>{getFormattedMessage("cash-advance.status.label")}</th>
                                        <th>{getFormattedMessage("react-data-table.action.column.label")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {singleCashAdvanceIdentity.cash_advances.map((advance) => (
                                        <tr key={advance.id}>
                                            <td>{moment(advance.date).format('DD/MM/YYYY')}</td>
                                            <td>{currencySymbolHandling(frontSetting?.value?.currency_symbol, advance.amount)}</td>
                                            <td>{currencySymbolHandling(frontSetting?.value?.currency_symbol, advance.paid_amount || 0)}</td>
                                            <td>
                                                <span className={`fw-bold ${(advance.outstanding_amount || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                                                    {currencySymbolHandling(frontSetting?.value?.currency_symbol, advance.outstanding_amount || 0)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${advance.status === 1 ? 'success' : 'warning'}`}>
                                                    {advance.status === 1 
                                                        ? getFormattedMessage("cash-advance.status.paid")
                                                        : getFormattedMessage("cash-advance.status.pending")
                                                    }
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => navigate(`/user/cash-advances/${advance.id}`)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvanceIdentities, frontSetting } = state;
    return {
        singleCashAdvanceIdentity: cashAdvanceIdentities.singleCashAdvanceIdentity,
        frontSetting: frontSetting,
    };
};

export default connect(mapStateToProps, { fetchCashAdvanceIdentityWithHistory })(CashAdvanceIdentityDetail);
