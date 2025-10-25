import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { useNavigate, useParams } from "react-router-dom";
import CashAdvanceIdentityForm from "./CashAdvanceIdentityForm";
import { editCashAdvanceIdentity, fetchCashAdvanceIdentity } from "../../store/action/cashAdvanceIdentityAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Alert } from "react-bootstrap-v5";

const EditCashAdvanceIdentity = (props) => {
    const { editCashAdvanceIdentity, fetchCashAdvanceIdentity, singleCashAdvanceIdentity, frontSetting } = props;
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                await fetchCashAdvanceIdentity(id);
                // Tunggu sebentar untuk memastikan data tersimpan di Redux store
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
                setError(err.response?.status || 'ERROR');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id, fetchCashAdvanceIdentity]);

    const editCashAdvanceIdentityData = (formValue) => {
        editCashAdvanceIdentity(id, formValue, navigate);
    };

    // Tampilkan loading jika masih loading ATAU data belum tersedia
    if (loading || !singleCashAdvanceIdentity || singleCashAdvanceIdentity.length === 0) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance-identity.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <div className="card">
                    <div className="card-body">
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">{getFormattedMessage("cash-advance-identity.dashboard.loading")}</p>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    if (error === 404) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance-identity.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <Alert variant="warning" className="text-center">
                    <h5>{getFormattedMessage("cash-advance-identity.dashboard.no_identities")}</h5>
                    <p>{getFormattedMessage("cash-advance-identity.not.found")}</p>
                </Alert>
            </MasterLayout>
        );
    }

    if (error === 403) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance-identity.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <Alert variant="danger" className="text-center">
                    <h5>{getFormattedMessage("cash-advance-identity.errors.unauthorized")}</h5>
                    <p>{getFormattedMessage("cash-advance-identity.errors.unauthorized")}</p>
                </Alert>
            </MasterLayout>
        );
    }

    if (error) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance-identity.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <Alert variant="danger" className="text-center">
                    <h5>{getFormattedMessage("cash-advance-identity.errors.loading_failed")}</h5>
                    <p>{getFormattedMessage("cash-advance-identity.errors.loading_failed")}</p>
                </Alert>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("cash-advance-identity.edit.title")}
                to="/user/cash-advance-identities"
            />
            <CashAdvanceIdentityForm
                editCashAdvanceIdentity={editCashAdvanceIdentityData}
                singleCashAdvanceIdentity={singleCashAdvanceIdentity}
                frontSetting={frontSetting}
            />
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

export default connect(mapStateToProps, { editCashAdvanceIdentity, fetchCashAdvanceIdentity })(EditCashAdvanceIdentity);
