import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import TabTitle from '../../shared/tab-title/TabTitle';
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
    getFormattedDate,
} from '../../shared/sharedMethod';
import { fetchDigitalSaleDetails } from '../../store/action/digitalSaleAction';
import TopProgressBar from '../../shared/components/loaders/TopProgressBar';
import Spinner from "../../shared/components/loaders/Spinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faMoneyBill, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const DigitalSaleDetails = (props) => {
    const {
        fetchDigitalSaleDetails,
        digitalSaleDetails,
        frontSetting,
        allConfigData,
        isLoading
    } = props;
    const { id } = useParams();

    useEffect(() => {
        fetchDigitalSaleDetails(id);
    }, [id]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 1:
                return <span className="badge bg-light-success">{getFormattedMessage("status.filter.complated.label")}</span>;
            case 2:
                return <span className="badge bg-light-primary">{getFormattedMessage("status.filter.pending.label")}</span>;
            case 3:
                return <span className="badge bg-light-danger">{getFormattedMessage("status.filter.cancelled.label")}</span>;
            default:
                return null;
        }
    };

    const saleDetails = digitalSaleDetails?.attributes || {};

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("digital-sales.details.title")}
                to="/user/digital-sales"
            />
            <TabTitle title={placeholderText("digital-sales.details.title")} />
            {isLoading ? <Spinner /> : (
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12">
                                <h4 className="font-weight-bold text-center mb-5">
                                    {getFormattedMessage("digital-sales.details.title")}: {saleDetails.reference_code}
                                </h4>
                            </div>
                        </div>

                        <div className="row custom-line-height">
                            <Col md={6}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage("digital-sale.transaction.info")}
                                </h5>
                                <div className="p-4">
                                    <div className="d-flex align-items-center pb-2">
                                        <FontAwesomeIcon icon={faCalendar} className="text-primary me-3 fs-5" />
                                        <div>
                                            <small className="text-muted">{getFormattedMessage("react-data-table.date.column.label")}</small>
                                            <div>{saleDetails.date && getFormattedDate(saleDetails.date, allConfigData)}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center pb-2">
                                        <FontAwesomeIcon icon={faUser} className="text-primary me-3 fs-5" />
                                        <div>
                                            <small className="text-muted">{getFormattedMessage("digital-sale.provider.label")}</small>
                                            <div>{saleDetails.provider_name}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center pb-2">
                                        <FontAwesomeIcon icon={faUser} className="text-primary me-3 fs-5" />
                                        <div>
                                            <small className="text-muted">{getFormattedMessage("users.table.user.column.title")}</small>
                                            <div>{saleDetails.user_name}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-primary me-3 fs-5" />
                                        <div>
                                            <small className="text-muted">{getFormattedMessage("globally.detail.status")}</small>
                                            <div>{getStatusBadge(saleDetails.status)}</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage("digital-sale.financial.info")}
                                </h5>
                                <div className="p-4">
                                    <div className="d-flex justify-content-between pb-2">
                                        <span>{getFormattedMessage("digital-sale.cost.label")}:</span>
                                        <span>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                frontSetting?.value?.currency_symbol,
                                                saleDetails.cost
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2">
                                        <span>{getFormattedMessage("digital-sale.price.label")}:</span>
                                        <span>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                frontSetting?.value?.currency_symbol,
                                                saleDetails.price
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2">
                                        <span>{getFormattedMessage("digital-sale.margin.label")}:</span>
                                        <span className={saleDetails.margin >= 0 ? 'text-success' : 'text-danger'}>
                                            <strong>
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    saleDetails.margin
                                                )}
                                            </strong>
                                        </span>
                                    </div>
                                    <hr />
                                    {saleDetails.note && (
                                        <div className="pb-2">
                                            <small className="text-muted">{getFormattedMessage("digital-sale.note.label")}:</small>
                                            <div>{saleDetails.note}</div>
                                        </div>
                                    )}
                                    {saleDetails.description && (
                                        <div>
                                            <small className="text-muted">{getFormattedMessage("digital-sale.description.label")}:</small>
                                            <div>{saleDetails.description}</div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </div>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { digitalSaleDetails, frontSetting, allConfigData, isLoading } = state;
    return { digitalSaleDetails, frontSetting, allConfigData, isLoading };
};

export default connect(mapStateToProps, { fetchDigitalSaleDetails })(DigitalSaleDetails);
