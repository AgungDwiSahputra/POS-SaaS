import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Row, Col, Badge, Button, ListGroup } from "react-bootstrap";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import { getFormattedMessage, currencySymbolHandling } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { fetchStore } from "../../store/action/storeAction";
import { fetchDigitalProviders } from "../../store/action/digitalProviderAction";
import { fetchStoreDigitalProviders } from "../../store/action/storeDigitalProviderAction";
import { fetchDigitalSales } from "../../store/action/digitalSaleAction";
import { fetchDigitalTopupRequests } from "../../store/action/digitalTopupRequestAction";
import { fetchDigitalWithdrawals } from "../../store/action/digitalWithdrawalAction";

const resolveLogoUrl = (logo) => {
    if (!logo) return "";
    const trimmed = logo.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    if (/^storage\//i.test(trimmed)) return `/${trimmed}`;
    if (/^app\//i.test(trimmed)) return `/storage/${trimmed}`;
    return `/storage/${trimmed}`;
};

const DigitalDashboard = ({
    stores,
    storeDigitalProviders,
    digitalSales,
    digitalTopupRequests,
    digitalWithdrawals,
    frontSetting,
    allConfigData,
    fetchStore,
    fetchDigitalProviders,
    fetchStoreDigitalProviders,
    fetchDigitalSales,
    fetchDigitalTopupRequests,
    fetchDigitalWithdrawals,
}) => {
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeBalance, setStoreBalance] = useState([]);

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";
    const providerBalances = useMemo(
        () => (Array.isArray(storeDigitalProviders) ? storeDigitalProviders : []),
        [storeDigitalProviders]
    );
    const salesList = useMemo(
        () => (Array.isArray(digitalSales) ? digitalSales : []),
        [digitalSales]
    );
    const topupList = useMemo(
        () => (Array.isArray(digitalTopupRequests) ? digitalTopupRequests : []),
        [digitalTopupRequests]
    );
    const withdrawalList = useMemo(
        () => (Array.isArray(digitalWithdrawals) ? digitalWithdrawals : []),
        [digitalWithdrawals]
    );

    useEffect(() => {
        fetchStore(false);
        fetchDigitalProviders({}, false);
        fetchStoreDigitalProviders({}, false);
        fetchDigitalSales({}, false);
        fetchDigitalTopupRequests({}, false);
        fetchDigitalWithdrawals({}, false);
    }, [
        fetchStore,
        fetchDigitalProviders,
        fetchStoreDigitalProviders,
        fetchDigitalSales,
        fetchDigitalTopupRequests,
        fetchDigitalWithdrawals,
    ]);

    useEffect(() => {
        if (Array.isArray(stores) && stores.length > 0 && !selectedStore) {
            const defaultStore =
                stores.find(
                    (store) => store.id === Number(frontSetting?.value?.default_warehouse)
                ) || stores[0];

            if (defaultStore?.id) {
                setSelectedStore(defaultStore.id);
            }
        }
    }, [stores, frontSetting, selectedStore]);

    useEffect(() => {
        if (selectedStore && providerBalances.length) {
            const balances = providerBalances.filter(
                (provider) => provider.attributes.store_id === selectedStore
            );
            setStoreBalance(balances);
        } else {
            setStoreBalance([]);
        }
    }, [selectedStore, providerBalances]);

    const formatCurrency = (amount) => currencySymbolHandling(allConfigData, currencySymbol, amount);

    const getTotalBalance = () =>
        storeBalance.reduce(
            (total, provider) => total + parseFloat(provider.attributes.balance || 0),
            0
        );

    const recentSales = useMemo(
        () =>
            salesList
                .filter((sale) => sale.attributes.status === "completed")
                .slice(0, 5),
        [salesList]
    );

    const pendingTopupRequests = useMemo(
        () =>
            topupList
                .filter((request) => request.attributes.status === "pending")
                .slice(0, 5),
        [topupList]
    );

    const recentWithdrawals = useMemo(
        () =>
            withdrawalList
                .filter((withdrawal) => withdrawal.attributes.status === "completed")
                .slice(0, 5),
        [withdrawalList]
    );

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={getFormattedMessage("digital.dashboard.title")} />

            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <i className="bi bi-lightning-charge me-2" />
                                {getFormattedMessage("digital-dashboard.quick-actions")}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-wrap gap-2">
                                <Link to="/user/digital/digital-sales/create">
                                    <Button variant="primary" size="sm">
                                        <i className="bi bi-plus-circle me-1" />
                                        {getFormattedMessage("digital-sale.create.title")}
                                    </Button>
                                </Link>
                                <Link to="/user/digital/digital-withdrawals/create">
                                    <Button variant="success" size="sm">
                                        <i className="bi bi-cash-coin me-1" />
                                        {getFormattedMessage("digital-withdrawal.create.title")}
                                    </Button>
                                </Link>
                                <Link to="/user/digital/digital-topup-requests/create">
                                    <Button variant="info" size="sm">
                                        <i className="bi bi-arrow-up-circle me-1" />
                                        {getFormattedMessage("topup-request.create.title")}
                                    </Button>
                                </Link>
                                <Link to="/user/digital/digital-balance">
                                    <Button variant="warning" size="sm">
                                        <i className="bi bi-wallet2 me-1" />
                                        {getFormattedMessage("digital-balance.title")}
                                    </Button>
                                </Link>
                                <Link to="/user/digital/digital-reports">
                                    <Button variant="secondary" size="sm">
                                        <i className="bi bi-graph-up me-1" />
                                        {getFormattedMessage("digital-reports.title")}
                                    </Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-wallet2 me-2" />
                                {getFormattedMessage("digital-balance.overview")}
                            </h5>
                            <Badge bg="primary">
                                {selectedStore
                                    ? stores?.find((s) => s.id === selectedStore)?.attributes?.name ||
                                      "-"
                                    : "Pilih Store"}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <div className="text-center">
                                        <i className="bi bi-piggy-bank fs-1 text-success mb-2" />
                                        <h4 className="mb-0 text-success">
                                            {formatCurrency(getTotalBalance())}
                                        </h4>
                                        <small className="text-muted">
                                            {getFormattedMessage("digital-balance.total-balance")}
                                        </small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <i className="bi bi-building fs-1 text-info mb-2" />
                                        <h4 className="mb-0 text-info">
                                            {storeBalance.filter((p) => p.attributes.is_active).length}
                                        </h4>
                                        <small className="text-muted">
                                            {getFormattedMessage("digital-balance.active-providers")}
                                        </small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <i className="bi bi-clock fs-1 text-warning mb-2" />
                                        <h4 className="mb-0 text-warning">{pendingTopupRequests.length}</h4>
                                        <small className="text-muted">
                                            {getFormattedMessage("topup-requests.pending-requests")}
                                        </small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <i className="bi bi-graph-up fs-1 text-primary mb-2" />
                                        <h4 className="mb-0 text-primary">{recentSales.length}</h4>
                                        <small className="text-muted">
                                            {getFormattedMessage("digital-sales.today-sales")}
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="bi bi-wallet2 me-2" />
                                {getFormattedMessage("digital-balance.provider-details")}
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {storeBalance.length > 0 ? (
                                <ListGroup variant="flush">
                                    {storeBalance.map((provider) => (
                                        <ListGroup.Item
                                            key={provider.id}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div className="d-flex align-items-center">
                                                {provider.attributes.digital_provider?.logo && (
                                                    <img
                                                        src={resolveLogoUrl(provider.attributes.digital_provider.logo)}
                                                        height="25"
                                                        width="25"
                                                        alt={provider.attributes.digital_provider.name}
                                                        className="me-2 rounded-circle"
                                                    />
                                                )}
                                                <div>
                                                    <strong>
                                                        {provider.attributes.digital_provider?.name || "-"}
                                                    </strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {provider.attributes.digital_provider?.code || "-"}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-success">
                                                    {formatCurrency(provider.attributes.balance)}
                                                </div>
                                                <Badge
                                                    bg={provider.attributes.is_active ? "success" : "danger"}
                                                >
                                                    {provider.attributes.is_active
                                                        ? getFormattedMessage("globally.active")
                                                        : getFormattedMessage("globally.in-active")}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-wallet2 fs-1 text-muted mb-2" />
                                    <p className="text-muted mb-0">
                                        {getFormattedMessage("digital-balance.no-balance-data")}
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="bi bi-clock-history me-2" />
                                {getFormattedMessage("digital-dashboard.recent-transactions")}
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {recentSales.length > 0 ? (
                                    recentSales.map((sale) => (
                                        <ListGroup.Item
                                            key={sale.id}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div className="fw-bold">
                                                    {sale.attributes.digital_product?.name || "-"}
                                                </div>
                                                <small className="text-muted">
                                                    {sale.attributes.customer_name || "-"} •{" "}
                                                    {sale.attributes.digital_provider?.name || "-"}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-success fw-bold">
                                                    +{formatCurrency(sale.attributes.margin)}
                                                </div>
                                                <small className="text-muted">
                                                    {sale.attributes.date
                                                        ? new Date(
                                                              sale.attributes.date
                                                          ).toLocaleDateString("id-ID")
                                                        : "-"}
                                                </small>
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bi bi-receipt fs-1 text-muted mb-2" />
                                        <p className="text-muted mb-0">
                                            {getFormattedMessage("digital-dashboard.no-recent-sales")}
                                        </p>
                                    </div>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {pendingTopupRequests.length > 0 && (
                <Row className="mt-4">
                    <Col md={12}>
                        <Card className="border-warning">
                            <Card.Header className="bg-warning text-dark">
                                <h6 className="mb-0">
                                    <i className="bi bi-exclamation-triangle me-2" />
                                    {getFormattedMessage("topup-requests.pending-requests")}
                                </h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <ListGroup variant="flush">
                                    {pendingTopupRequests.map((request) => (
                                        <ListGroup.Item
                                            key={request.id}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div className="fw-bold">
                                                    {request.attributes.digital_provider?.name || "-"}
                                                </div>
                                                <small className="text-muted">
                                                    {request.attributes.store?.name || "-"} •{" "}
                                                    {request.attributes.requested_by?.first_name || "-"}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-primary fw-bold">
                                                    {formatCurrency(request.attributes.amount)}
                                                </div>
                                                <small className="text-muted">
                                                    {request.attributes.created_at
                                                        ? new Date(
                                                              request.attributes.created_at
                                                          ).toLocaleDateString("id-ID")
                                                        : "-"}
                                                </small>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        stores,
        storeDigitalProviders: storeDigitalProvidersState = {},
        digitalSales: digitalSalesState = {},
        digitalTopupRequests: digitalTopupRequestsState = {},
        digitalWithdrawals: digitalWithdrawalsState = {},
        frontSetting,
        allConfigData,
    } = state;

    return {
        stores,
        storeDigitalProviders: storeDigitalProvidersState.storeDigitalProviders || [],
        digitalSales: digitalSalesState.digitalSales || [],
        digitalTopupRequests: digitalTopupRequestsState.digitalTopupRequests || [],
        digitalWithdrawals: digitalWithdrawalsState.digitalWithdrawals || [],
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchStore,
    fetchDigitalProviders,
    fetchStoreDigitalProviders,
    fetchDigitalSales,
    fetchDigitalTopupRequests,
    fetchDigitalWithdrawals,
})(DigitalDashboard);
