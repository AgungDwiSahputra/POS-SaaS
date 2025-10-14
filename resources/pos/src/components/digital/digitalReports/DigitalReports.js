import React, { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import ReactSelect from "../../../shared/select/reactSelect";
import DateRangePicker from "../../../shared/datepicker/DateRangePicker";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { Card, Row, Col, Form, Table } from "react-bootstrap";
import { fetchStore } from "../../../store/action/storeAction";
import { fetchDigitalProviders } from "../../../store/action/digitalProviderAction";
import { fetchDigitalSales } from "../../../store/action/digitalSaleAction";
import { fetchDigitalWithdrawals } from "../../../store/action/digitalWithdrawalAction";

const DigitalReports = (props) => {
    const {
        stores,
        digitalProviders,
        digitalSales,
        digitalWithdrawals,
        frontSetting,
        allConfigData,
        fetchStore,
        fetchDigitalProviders,
        fetchDigitalSales,
        fetchDigitalWithdrawals,
    } = props;

    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
    });

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    const storeList = useMemo(() => (Array.isArray(stores) ? stores : []), [stores]);
    const providerList = useMemo(
        () => (Array.isArray(digitalProviders) ? digitalProviders : []),
        [digitalProviders]
    );
    const salesList = useMemo(
        () => (Array.isArray(digitalSales) ? digitalSales : []),
        [digitalSales]
    );
    const withdrawalList = useMemo(
        () => (Array.isArray(digitalWithdrawals) ? digitalWithdrawals : []),
        [digitalWithdrawals]
    );

    useEffect(() => {
        fetchStore(false);
        fetchDigitalProviders({}, false);
        fetchDigitalSales({}, false);
        fetchDigitalWithdrawals({}, false);
    }, [
        fetchStore,
        fetchDigitalProviders,
        fetchDigitalSales,
        fetchDigitalWithdrawals,
    ]);

    const formatCurrency = (amount) => {
        return currencySymbolHandling(allConfigData, currencySymbol, amount);
    };

    // Filter data based on selections
    const getFilteredSales = () => {
        if (!salesList.length) return [];

        let filtered = salesList;

        if (selectedStore) {
            filtered = filtered.filter(sale => sale.attributes.store_id === selectedStore.value);
        }

        if (selectedProvider) {
            filtered = filtered.filter(sale => sale.attributes.digital_provider_id === selectedProvider.value);
        }

        if (dateRange.startDate && dateRange.endDate) {
            filtered = filtered.filter(sale => {
                const saleDate = new Date(sale.attributes.date);
                return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate;
            });
        }

        return filtered;
    };

    const getFilteredWithdrawals = () => {
        if (!withdrawalList.length) return [];

        let filtered = withdrawalList;

        if (selectedStore) {
            filtered = filtered.filter(withdrawal => withdrawal.attributes.store_id === selectedStore.value);
        }

        if (selectedProvider) {
            filtered = filtered.filter(withdrawal => withdrawal.attributes.digital_provider_id === selectedProvider.value);
        }

        if (dateRange.startDate && dateRange.endDate) {
            filtered = filtered.filter(withdrawal => {
                const withdrawalDate = new Date(withdrawal.attributes.date);
                return withdrawalDate >= dateRange.startDate && withdrawalDate <= dateRange.endDate;
            });
        }

        return filtered;
    };

    const filteredSales = getFilteredSales();
    const filteredWithdrawals = getFilteredWithdrawals();

    // Calculate summary data
    const totalSales = filteredSales
        .filter(sale => sale.attributes.status === 'completed')
        .reduce((total, sale) => total + parseFloat(sale.attributes.sell_price || 0), 0);

    const totalCost = filteredSales
        .filter(sale => sale.attributes.status === 'completed')
        .reduce((total, sale) => total + parseFloat(sale.attributes.cost_price || 0), 0);

    const totalMargin = filteredSales
        .filter(sale => sale.attributes.status === 'completed')
        .reduce((total, sale) => total + parseFloat(sale.attributes.margin || 0), 0);

    const totalWithdrawalAmount = filteredWithdrawals
        .filter(withdrawal => withdrawal.attributes.status === 'completed')
        .reduce((total, withdrawal) => total + parseFloat(withdrawal.attributes.withdrawal_amount || 0), 0);

    const totalAdminFee = filteredWithdrawals
        .filter(withdrawal => withdrawal.attributes.status === 'completed')
        .reduce((total, withdrawal) => total + parseFloat(withdrawal.attributes.admin_fee || 0), 0);

    const netRevenue = totalSales - totalWithdrawalAmount;

    const storeOptions = storeList.map((store) => ({
        label: store.attributes.name,
        value: store.id,
    }));

    const providerOptions = providerList.map((provider) => ({
        label: `${provider.attributes.name} (${provider.attributes.code})`,
        value: provider.id,
    }));

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={getFormattedMessage("digital.reports.title")} />

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>{getFormattedMessage("store.title")}</Form.Label>
                                <ReactSelect
                                    data={storeOptions}
                                    value={selectedStore}
                                    onChange={setSelectedStore}
                                    placeholder={placeholderText("store.select.placeholder")}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>{getFormattedMessage("digital-provider.title")}</Form.Label>
                                <ReactSelect
                                    data={providerOptions}
                                    value={selectedProvider}
                                    onChange={setSelectedProvider}
                                    placeholder={placeholderText("digital-provider.select.placeholder")}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>{getFormattedMessage("globally.detail.date-range")}</Form.Label>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center border-primary">
                        <Card.Body>
                            <Card.Title className="text-primary">
                                <i className="bi bi-graph-up fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {formatCurrency(totalSales)}
                            </h3>
                            <small className="text-muted">
                                {getFormattedMessage("digital-reports.total-sales")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center border-info">
                        <Card.Body>
                            <Card.Title className="text-info">
                                <i className="bi bi-piggy-bank fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {formatCurrency(totalMargin)}
                            </h3>
                            <small className="text-muted">
                                {getFormattedMessage("digital-reports.total-margin")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center border-warning">
                        <Card.Body>
                            <Card.Title className="text-warning">
                                <i className="bi bi-cash-coin fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {formatCurrency(totalWithdrawalAmount)}
                            </h3>
                            <small className="text-muted">
                                {getFormattedMessage("digital-reports.total-withdrawal")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center border-success">
                        <Card.Body>
                            <Card.Title className="text-success">
                                <i className="bi bi-wallet2 fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {formatCurrency(netRevenue)}
                            </h3>
                            <small className="text-muted">
                                {getFormattedMessage("digital-reports.net-revenue")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sales Report Table */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                {getFormattedMessage("digital-reports.sales-report")}
                            </h5>
                            <span className="badge bg-primary">
                                {filteredSales.length} {getFormattedMessage("digital-reports.transactions")}
                            </span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {filteredSales.length > 0 ? (
                                <div className="table-responsive">
                                    <Table striped hover className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>{getFormattedMessage("globally.detail.date")}</th>
                                                <th>{getFormattedMessage("store.title")}</th>
                                                <th>{getFormattedMessage("digital-provider.title")}</th>
                                                <th>{getFormattedMessage("product.title")}</th>
                                                <th>{getFormattedMessage("customer.name")}</th>
                                                <th className="text-end">{getFormattedMessage("product.product-details.cost.label")}</th>
                                                <th className="text-end">{getFormattedMessage("price.title")}</th>
                                                <th className="text-end">{getFormattedMessage("globally.detail.margin")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSales.map((sale) => (
                                                <tr key={sale.id}>
                                                    <td>
                                                        {new Date(sale.attributes.date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td>{sale.attributes.store?.name || "-"}</td>
                                                    <td>{sale.attributes.digital_provider?.name || "-"}</td>
                                                    <td>{sale.attributes.digital_product?.name || "-"}</td>
                                                    <td>{sale.attributes.customer_name || "-"}</td>
                                                    <td className="text-end text-danger">
                                                        {formatCurrency(sale.attributes.cost_price)}
                                                    </td>
                                                    <td className="text-end text-success fw-bold">
                                                        {formatCurrency(sale.attributes.sell_price)}
                                                    </td>
                                                    <td className="text-end text-primary fw-bold">
                                                        {formatCurrency(sale.attributes.margin)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <th colSpan={5} className="text-end">
                                                    {getFormattedMessage("globally.detail.total")}:
                                                </th>
                                                <th className="text-end text-danger">
                                                    {formatCurrency(totalCost)}
                                                </th>
                                                <th className="text-end text-success fw-bold">
                                                    {formatCurrency(totalSales)}
                                                </th>
                                                <th className="text-end text-primary fw-bold">
                                                    {formatCurrency(totalMargin)}
                                                </th>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-receipt fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">
                                        {getFormattedMessage("digital-reports.no-sales-data")}
                                    </h5>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Withdrawal Report Table */}
            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                {getFormattedMessage("digital-reports.withdrawal-report")}
                            </h5>
                            <span className="badge bg-warning">
                                {filteredWithdrawals.length} {getFormattedMessage("digital-reports.transactions")}
                            </span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {filteredWithdrawals.length > 0 ? (
                                <div className="table-responsive">
                                    <Table striped hover className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>{getFormattedMessage("globally.detail.date")}</th>
                                                <th>{getFormattedMessage("store.title")}</th>
                                                <th>{getFormattedMessage("digital-provider.title")}</th>
                                                <th>{getFormattedMessage("customer.name")}</th>
                                                <th className="text-end">{getFormattedMessage("digital-withdrawal.withdrawal-amount.label")}</th>
                                                <th className="text-end">{getFormattedMessage("digital-withdrawal.admin-fee.label")}</th>
                                                <th className="text-end">{getFormattedMessage("digital-withdrawal.total-amount.label")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredWithdrawals.map((withdrawal) => (
                                                <tr key={withdrawal.id}>
                                                    <td>
                                                        {new Date(withdrawal.attributes.date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td>{withdrawal.attributes.store?.name || "-"}</td>
                                                    <td>{withdrawal.attributes.digital_provider?.name || "-"}</td>
                                                    <td>{withdrawal.attributes.customer_name}</td>
                                                    <td className="text-end text-success fw-bold">
                                                        {formatCurrency(withdrawal.attributes.withdrawal_amount)}
                                                    </td>
                                                    <td className="text-end text-info">
                                                        {formatCurrency(withdrawal.attributes.admin_fee)}
                                                    </td>
                                                    <td className="text-end text-primary fw-bold">
                                                        {formatCurrency(withdrawal.attributes.total_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <th colSpan={4} className="text-end">
                                                    {getFormattedMessage("globally.detail.total")}:
                                                </th>
                                                <th className="text-end text-success fw-bold">
                                                    {formatCurrency(totalWithdrawalAmount)}
                                                </th>
                                                <th className="text-end text-info">
                                                    {formatCurrency(totalAdminFee)}
                                                </th>
                                                <th className="text-end text-primary fw-bold">
                                                    {formatCurrency(totalWithdrawalAmount + totalAdminFee)}
                                                </th>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-cash-coin fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">
                                        {getFormattedMessage("digital-reports.no-withdrawal-data")}
                                    </h5>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        stores,
        digitalProviders: digitalProvidersState = {},
        digitalSales: digitalSalesState = {},
        digitalWithdrawals: digitalWithdrawalsState = {},
        frontSetting,
        allConfigData,
    } = state;

    return {
        stores,
        digitalProviders: digitalProvidersState.activeProviders || digitalProvidersState.digitalProviders || [],
        digitalSales: digitalSalesState.digitalSales || [],
        digitalWithdrawals: digitalWithdrawalsState.digitalWithdrawals || [],
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchStore,
    fetchDigitalProviders,
    fetchDigitalSales,
    fetchDigitalWithdrawals,
})(DigitalReports);
