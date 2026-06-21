import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchIdentitiesWithSummary } from "../../store/action/cashAdvanceIdentityAction";
import { fetchCashAdvances, deleteCashAdvance } from "../../store/action/cashAdvanceAction";
import { getFormattedMessage, currencySymbolHandling, placeholderText } from "../../shared/sharedMethod";
import { useIntl } from "react-intl";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Button, Card, Row, Col, Badge, InputGroup, Form, Tabs, Tab, Table } from "react-bootstrap-v5";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMoneyBill, faExclamationTriangle, faSearch, faPlus, faList, faEye, faEdit, faTrash, faCreditCard, faCheck } from "@fortawesome/free-solid-svg-icons";
import CashAdvancePaymentsModal from "../cash-advance/CashAdvancePaymentsModal";
import DeleteCashAdvance from "../cash-advance/DeleteCashAdvance";

const CashAdvanceIdentityDashboard = (props) => {
    const {
        fetchIdentitiesWithSummary,
        identitiesWithSummary,
        fetchCashAdvances,
        cashAdvances,
        frontSetting,
        allConfigData,
        isLoading,
        deleteCashAdvance,
    } = props;
    const navigate = useNavigate();
    const intl = useIntl();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [activeTab, setActiveTab] = useState("identities");
    const [selectedIdentity, setSelectedIdentity] = useState(null);
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [selectedCashAdvance, setSelectedCashAdvance] = useState(null);
    const [deleteModel, setDeleteModel] = useState(false);
    const [onDelete, setOnDelete] = useState(null);

    useEffect(() => {
        fetchIdentitiesWithSummary();
        // Tidak fetch semua cash advances di awal, akan di-fetch per identity saat dipilih
    }, []);

    // Reset state saat tab berubah kembali ke identities
    useEffect(() => {
        if (activeTab === "identities" && selectedIdentity) {
            setSelectedIdentity(null);
            // Reset cash advances ke kosong saat kembali ke tab identities
            // agar tidak menampilkan data identity sebelumnya
        }
    }, [activeTab]);

    const filteredIdentities = identitiesWithSummary?.filter(identity => {
        const matchesSearch = identity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            identity.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            identity.department?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === "all" || identity.type === filterType;
        
        // Perbaikan logika filter status - handle boolean dan integer dengan benar
        const matchesStatus = filterStatus === "all" ||
                             (filterStatus === "active" && (identity.is_active === true || identity.is_active === 1)) ||
                             (filterStatus === "inactive" && (identity.is_active === false || identity.is_active === 0));
        
        return matchesSearch && matchesType && matchesStatus;
    }) || [];

    const totalIdentities = identitiesWithSummary?.length || 0;
    const totalOutstanding = identitiesWithSummary?.reduce((sum, identity) => {
        const value = parseFloat(identity.total_outstanding);
        return sum + (isNaN(value) ? 0 : value);
    }, 0) || 0;
    const totalAmount = identitiesWithSummary?.reduce((sum, identity) => {
        const value = parseFloat(identity.total_amount);
        return sum + (isNaN(value) ? 0 : value);
    }, 0) || 0;
    const totalPaid = identitiesWithSummary?.reduce((sum, identity) => {
        const value = parseFloat(identity.total_paid);
        return sum + (isNaN(value) ? 0 : value);
    }, 0) || 0;
    const activeIdentities = identitiesWithSummary?.filter(identity => identity.is_active === true || identity.is_active === 1).length || 0;

    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'employee': return 'primary';
            case 'contractor': return 'warning';
            case 'other': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'paid': return 'info';
            default: return 'secondary';
        }
    };

    const getOutstandingBadgeColor = (amount) => {
        if (amount === 0) return 'success';
        if (amount < 1000) return 'warning';
        return 'danger';
    };

    // Tidak perlu filter lokal lagi karena sudah di-filter di backend saat memilih identity
    // Urutkan dari data terbaru berdasarkan created_at
    const filteredCashAdvances = cashAdvances ? [...cashAdvances].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];

    const handleIdentitySelect = (identity) => {
        setSelectedIdentity(identity);
        // Fetch cash advances untuk identity ini saja dengan pageSize besar
        fetchCashAdvances({ identity_id: identity.id, pageSize: 999 });
        setActiveTab("cash-advances");
    };

    const handlePaymentClick = (cashAdvance) => {
        setSelectedCashAdvance(cashAdvance);
        setShowPaymentsModal(true);
    };

    const handlePaymentSuccess = () => {
        // Refresh cash advances data after payment
        if (selectedIdentity) {
            fetchCashAdvances({ identity_id: selectedIdentity.id, pageSize: 999 });
        }
        setShowPaymentsModal(false);
        setSelectedCashAdvance(null);
    };

    const onClickDeleteModel = (isDeleteModel) => {
        setDeleteModel(isDeleteModel);
    };

    const onDeleteCashAdvance = (cashAdvance) => {
        setOnDelete(cashAdvance);
        setDeleteModel(true);
    };

    const handleDeleteSuccess = () => {
        // Refresh data after delete
        if (selectedIdentity) {
            fetchCashAdvances({ identity_id: selectedIdentity.id, pageSize: 999 });
        }
        fetchIdentitiesWithSummary();
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("cash-advance-identity.dashboard.title")} />
            
            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="identities" title={getFormattedMessage("cash-advance-identity.tab.identities")}>
                    {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FontAwesomeIcon icon={faUser} className="text-primary fs-1 mb-2" />
                            <h5 className="card-title">{totalIdentities}</h5>
                            <p className="card-text text-muted">
                                {getFormattedMessage("cash-advance-identity.summary.total_identities")}
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FontAwesomeIcon icon={faUser} className="text-success fs-1 mb-2" />
                            <h5 className="card-title">{activeIdentities}</h5>
                            <p className="card-text text-muted">
                                {getFormattedMessage("cash-advance-identity.summary.active_identities")}
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FontAwesomeIcon icon={faMoneyBill} className="text-info fs-1 mb-2" />
                            <h5 className="card-title">
                                {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, totalAmount)}
                            </h5>
                            <p className="card-text text-muted">
                                {getFormattedMessage("cash-advance-identity.summary.total_amount")}
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger fs-1 mb-2" />
                            <h5 className="card-title">
                                {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, totalOutstanding)}
                            </h5>
                            <p className="card-text text-muted">
                                {getFormattedMessage("cash-advance-identity.summary.outstanding")}
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">{getFormattedMessage("cash-advance-identity.dashboard.quick_actions")}</h5>
                                <div>
                                    <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => navigate("/user/cash-advance-identities/create")}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        {getFormattedMessage("cash-advance-identity.create.title")}
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => navigate("/user/cash-advances/create")}
                                        disabled={activeIdentities === 0}
                                    >
                                        <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                                        {getFormattedMessage("cash-advance.create.title")}
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col xs={12} md={6} className="mb-2 mb-md-0">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FontAwesomeIcon icon={faSearch} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder={intl.formatMessage({ id: "cash-advance-identity.dashboard.search_placeholder" })}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col xs={6} md={2} className="mb-2 mb-md-0">
                                    <Form.Select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="all">{intl.formatMessage({ id: "cash-advance-identity.filter.all_types" })}</option>
                                        <option value="employee">{intl.formatMessage({ id: "cash-advance-identity.input.type.employee" })}</option>
                                        <option value="contractor">{intl.formatMessage({ id: "cash-advance-identity.input.type.contractor" })}</option>
                                        <option value="other">{intl.formatMessage({ id: "cash-advance-identity.input.type.other" })}</option>
                                    </Form.Select>
                                </Col>
                                <Col xs={6} md={2} className="mb-2 mb-md-0">
                                    <Form.Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">{intl.formatMessage({ id: "cash-advance-identity.filter.all_status" })}</option>
                                        <option value="active">{intl.formatMessage({ id: "cash-advance-identity.filter.active_only" })}</option>
                                        <option value="inactive">{intl.formatMessage({ id: "cash-advance-identity.filter.inactive_only" })}</option>
                                    </Form.Select>
                                </Col>
                                <Col xs={12} md={4}>
                                    <div className="text-muted text-center text-md-start">
                                        {intl.formatMessage({ id: "cash-advance-identity.dashboard.showing" })}: {filteredIdentities.length} {intl.formatMessage({ id: "cash-advance-identity.dashboard.of" })} {totalIdentities}
                                    </div>
                                </Col>
                                {/* <Col xs={6} md={3}>
                                    <div className="text-muted text-center text-md-start">
                                        {intl.formatMessage({ id: "cash-advance-identity.dashboard.showing" })}: {filteredIdentities.length} {intl.formatMessage({ id: "cash-advance-identity.dashboard.of" })} {totalIdentities}
                                    </div>
                                </Col> */}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Identities List */}
            <Row>
                {filteredIdentities.map((identity) => (
                    <Col md={6} lg={4} key={identity.id} className="mb-4">
                        <Card className={`h-100 ${!identity.is_active ? 'border-secondary' : ''}`}>
                            <Card.Header className="w-100 d-flex justify-content-start align-items-start flex-column gap-2">
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => navigate(`/user/cash-advance-identities/edit/${identity.id}`)}
                                    title={getFormattedMessage("cash-advance-identity.edit.title")}
                                >
                                    <FontAwesomeIcon icon={faEdit} className="me-1" />
                                    {getFormattedMessage("globally.edit.label")}
                                </Button>
                                <div className="w-100 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{identity.name}</h6>
                                        {identity.employee_id && (
                                            <small className="text-muted">ID: {identity.employee_id}</small>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Badge bg={identity.is_active ? 'success' : 'secondary'}>
                                            {identity.is_active ? getFormattedMessage("cash-advance-identity.status.active") : getFormattedMessage("cash-advance-identity.status.inactive")}
                                        </Badge>
                                        <Badge bg={getTypeBadgeColor(identity.type)}>
                                            {identity.type === 'employee' ? getFormattedMessage("cash-advance-identity.input.type.employee") :
                                            identity.type === 'contractor' ? getFormattedMessage("cash-advance-identity.input.type.contractor") : getFormattedMessage("cash-advance-identity.input.type.other")}
                                        </Badge>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    {identity.department && (
                                        <div className="text-muted">
                                            <strong>{getFormattedMessage("cash-advance-identity.input.department.label")}:</strong> {identity.department}
                                        </div>
                                    )}
                                    {identity.phone && (
                                        <div className="text-muted">
                                            <strong>{getFormattedMessage("cash-advance-identity.input.phone.label")}:</strong> {identity.phone}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="row text-center">
                                    <div className="col-4">
                                        <div className="fw-bold text-primary">{identity.total_advances || 0}</div>
                                        <small className="text-muted">{getFormattedMessage("cash-advance-identity.summary.total_advances")}</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="fw-bold text-info">
                                            {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, (() => {
                                                const value = parseFloat(identity.total_amount);
                                                return isNaN(value) ? 0 : value;
                                            })())}
                                        </div>
                                        <small className="text-muted">{getFormattedMessage("cash-advance-identity.summary.total_amount")}</small>
                                    </div>
                                    <div className="col-4">
                                        <div className={`fw-bold ${(() => {
                                            const value = parseFloat(identity.total_outstanding);
                                            return (isNaN(value) ? 0 : value) > 0 ? 'text-danger' : 'text-success';
                                        })()}`}>
                                            {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, (() => {
                                                const value = parseFloat(identity.total_outstanding);
                                                return isNaN(value) ? 0 : value;
                                            })())}
                                        </div>
                                        <small className="text-muted">{getFormattedMessage("cash-advance-identity.summary.outstanding")}</small>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Footer className="d-flex justify-content-between">
                                <div className="btn-group" role="group">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleIdentitySelect(identity)}
                                    >
                                        <FontAwesomeIcon icon={faList} className="me-1" />
                                        {getFormattedMessage("cash-advance-identity.dashboard.view_cash_advances")}
                                    </Button>
                                </div>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => navigate(`/user/cash-advances/create?identity_id=${identity.id}`)}
                                    disabled={!identity.is_active}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                                    {getFormattedMessage("cash-advance.create.title")}
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {filteredIdentities.length === 0 && !isLoading && (
                <Row>
                    <Col>
                        <Card>
                            <Card.Body className="text-center py-5">
                                <FontAwesomeIcon icon={faUser} className="text-muted fs-1 mb-3" />
                                <h5 className="text-muted">
                                    {getFormattedMessage("cash-advance-identity.dashboard.no_identities")}
                                </h5>
                                <p className="text-muted">
                                    {getFormattedMessage("cash-advance-identity.dashboard.no_identities_description")}
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate("/user/cash-advance-identities/create")}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                                    {getFormattedMessage("cash-advance-identity.create.title")}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
                </Tab>
                
                <Tab eventKey="cash-advances" title={getFormattedMessage("cash-advance-identity.tab.cash-advances")}>
                    {selectedIdentity ? (
                        <div>
                            {filteredCashAdvances.length > 0 ? (
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Header className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
                                                <div className="mb-2 mb-lg-0">
                                                    <h5 className="mb-1">{getFormattedMessage("cash-advance-identity.dashboard.cash_advances_for")} {selectedIdentity.name}</h5>
                                                    <small className="text-muted">
                                                        {selectedIdentity.employee_id && `ID: ${selectedIdentity.employee_id}`}
                                                        {selectedIdentity.department && ` • ${selectedIdentity.department}`}
                                                    </small>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/user/cash-advances/create?identity_id=${selectedIdentity.id}`)}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                                                        <span className="d-none d-sm-inline">{getFormattedMessage("cash-advance.create.title")}</span>
                                                        <span className="d-inline d-sm-none">{getFormattedMessage("cash-advance.create.short")}</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => setActiveTab("identities")}
                                                    >
                                                        <span className="d-none d-sm-inline">{getFormattedMessage("cash-advance-identity.dashboard.back_to_identities")}</span>
                                                        <span className="d-inline d-sm-none">{getFormattedMessage("cash-advance-identity.dashboard.back")}</span>
                                                    </Button>
                                                </div>
                                            </Card.Header>
                                            <Card.Body className="p-0">
                                                <div className="table-responsive">
                                                    <Table striped hover className="mb-0">
                                                        <thead style={{ backgroundColor: '#212529 !important' }}>
                                                            <tr style={{ backgroundColor: '#212529 !important' }}>
                                                                <th 
                                                                    className="text-nowrap d-none d-md-table-cell" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("globally.detail.reference")}
                                                                </th>
                                                                <th 
                                                                    className="text-nowrap" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("amount.title")}
                                                                </th>
                                                                <th 
                                                                    className="text-nowrap d-none d-lg-table-cell" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("cash-advance.table.paid-amount")}
                                                                </th>
                                                                <th 
                                                                    className="text-nowrap" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("cash-advance.table.outstanding")}
                                                                </th>
                                                                <th 
                                                                    className="text-nowrap d-none d-sm-table-cell" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("globally.detail.status")}
                                                                </th>
                                                                <th 
                                                                    className="text-nowrap d-none d-md-table-cell" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("globally.detail.date")}
                                                                </th>
                                                                <th 
                                                                    className="text-nowrap text-center" 
                                                                    style={{ 
                                                                        backgroundColor: '#212529 !important',
                                                                        color: '#ffffff !important',
                                                                        fontWeight: '700 !important',
                                                                        textTransform: 'uppercase !important',
                                                                        borderColor: '#495057 !important'
                                                                    }}
                                                                >
                                                                    {getFormattedMessage("react-data-table.action.column.label")}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                    <tbody>
                                                        {filteredCashAdvances.map((cashAdvance) => {
                                                            const amount = parseFloat(cashAdvance.amount) || 0;
                                                            const paidAmount = parseFloat(cashAdvance.paid_amount) || 0;
                                                            const outstanding = amount - paidAmount;
                                                            const isPaid = cashAdvance.status === 1;
                                                            const statusText = isPaid ? getFormattedMessage("cash-advance.status.paid") : getFormattedMessage("cash-advance.status.outstanding");
                                                            const formattedDate = cashAdvance.date ? new Date(cashAdvance.date).toLocaleDateString() : 'N/A';
                                                            
                                                            return (
                                                                <tr key={cashAdvance.id}>
                                                                    <td className="d-none d-md-table-cell">
                                                                        <span className="fw-medium">{cashAdvance.reference_code || 'N/A'}</span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex flex-column">
                                                                            <span className="fw-bold">
                                                                                {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, amount)}
                                                                            </span>
                                                                            <small className="text-muted d-md-none">
                                                                                Ref: {cashAdvance.reference_code || 'N/A'}
                                                                            </small>
                                                                        </div>
                                                                    </td>
                                                                    <td className="d-none d-lg-table-cell">
                                                                        {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, paidAmount)}
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex flex-column">
                                                                            <Badge bg={getOutstandingBadgeColor(outstanding)} className="mb-1">
                                                                                {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, outstanding)}
                                                                            </Badge>
                                                                            <small className="text-muted d-lg-none">
                                                                                Paid: {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, paidAmount)}
                                                                            </small>
                                                                        </div>
                                                                    </td>
                                                                    <td className="d-none d-sm-table-cell">
                                                                        <Badge bg={getStatusBadgeColor(cashAdvance.status)}>
                                                                            {statusText}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="d-none d-md-table-cell">
                                                                        <small>{formattedDate}</small>
                                                                    </td>
                                                                <td>
                                                                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                                        {!isPaid && (
                                                                            <Button
                                                                                variant="outline-success"
                                                                                size="sm"
                                                                                onClick={() => handlePaymentClick(cashAdvance)}
                                                                                title={getFormattedMessage("cash-advance.payment.make_payment")}
                                                                                className="d-flex align-items-center justify-content-center"
                                                                                style={{ minWidth: '40px', minHeight: '40px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faCreditCard} />
                                                                                <span className="d-none d-lg-inline ms-1">{getFormattedMessage("cash-advance.payment.pay")}</span>
                                                                            </Button>
                                                                        )}
                                                                        {!isPaid && (
                                                                            <Button
                                                                                variant="outline-warning"
                                                                                size="sm"
                                                                                onClick={() => navigate(`/user/cash-advances/edit/${cashAdvance.id}`)}
                                                                                title={getFormattedMessage("globally.edit.label")}
                                                                                className="d-none d-sm-inline-flex align-items-center justify-content-center"
                                                                                style={{ minWidth: '40px', minHeight: '40px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faEdit} />
                                                                            </Button>
                                                                        )}
                                                                        {!isPaid && (
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                onClick={() => onDeleteCashAdvance(cashAdvance)}
                                                                                title={getFormattedMessage("globally.delete.label")}
                                                                                className="d-none d-sm-inline-flex align-items-center justify-content-center"
                                                                                style={{ minWidth: '40px', minHeight: '40px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                            </Button>
                                                                        )}
                                                                        {isPaid && (
                                                                            <span className="text-muted small d-flex align-items-center">
                                                                                <FontAwesomeIcon icon={faCheck} className="me-1 text-success" />
                                                                                {getFormattedMessage("cash-advance.status.paid")}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    </Table>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            ) : (
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Body className="text-center py-5">
                                                <FontAwesomeIcon icon={faMoneyBill} className="text-muted fs-1 mb-3" />
                                                <h5 className="text-muted">{getFormattedMessage("cash-advance-identity.dashboard.no_cash_advances_found")}</h5>
                                                <p className="text-muted">
                                                    {getFormattedMessage("cash-advance-identity.dashboard.no_cash_advances_description")}
                                                </p>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => navigate(`/user/cash-advances/create?identity_id=${selectedIdentity.id}`)}
                                                    disabled={!selectedIdentity.is_active}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                    {getFormattedMessage("cash-advance.create.first")}
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    ) : (
                        <Row>
                            <Col>
                                <Card>
                                    <Card.Body className="text-center py-5">
                                        <FontAwesomeIcon icon={faUser} className="text-muted fs-1 mb-3" />
                                        <h5 className="text-muted">{getFormattedMessage("cash-advance-identity.dashboard.select_identity")}</h5>
                                        <p className="text-muted">
                                            {getFormattedMessage("cash-advance-identity.dashboard.select_identity_description")}
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={() => setActiveTab("identities")}
                                        >
                                            {getFormattedMessage("cash-advance-identity.dashboard.go_to_identities")}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Tab>
            </Tabs>
            
            {/* Payments Modal */}
            {selectedCashAdvance && (
                <CashAdvancePaymentsModal
                    show={showPaymentsModal}
                    onHide={() => {
                        setShowPaymentsModal(false);
                        setSelectedCashAdvance(null);
                    }}
                    cashAdvance={selectedCashAdvance}
                    frontSetting={frontSetting}
                    allConfigData={allConfigData}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}

            {/* Delete Modal */}
            <DeleteCashAdvance
                deleteModel={deleteModel}
                onClickDeleteModel={onClickDeleteModel}
                onDelete={onDelete}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvanceIdentities, cashAdvances, frontSetting, allConfigData } = state;
    return {
        identitiesWithSummary: cashAdvanceIdentities.identitiesWithSummary || [],
        cashAdvances: cashAdvances || [],
        frontSetting: frontSetting,
        allConfigData: allConfigData,
        isLoading: cashAdvanceIdentities.isLoading,
    };
};

export default connect(mapStateToProps, { fetchIdentitiesWithSummary, fetchCashAdvances, deleteCashAdvance })(CashAdvanceIdentityDashboard);
