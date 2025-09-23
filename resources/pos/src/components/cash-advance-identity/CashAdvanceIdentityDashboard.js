import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchIdentitiesWithSummary } from "../../store/action/cashAdvanceIdentityAction";
import { fetchCashAdvances } from "../../store/action/cashAdvanceAction";
import { getFormattedMessage, currencySymbolHandling } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Button, Card, Row, Col, Badge, InputGroup, Form, Tabs, Tab, Table } from "react-bootstrap-v5";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMoneyBill, faExclamationTriangle, faSearch, faPlus, faList, faEye, faEdit, faTrash, faCreditCard, faCheck } from "@fortawesome/free-solid-svg-icons";
import CashAdvancePaymentsModal from "../cash-advance/CashAdvancePaymentsModal";

const CashAdvanceIdentityDashboard = (props) => {
    const {
        fetchIdentitiesWithSummary,
        identitiesWithSummary,
        fetchCashAdvances,
        cashAdvances,
        frontSetting,
        allConfigData,
        isLoading,
    } = props;
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [activeTab, setActiveTab] = useState("identities");
    const [selectedIdentity, setSelectedIdentity] = useState(null);
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [selectedCashAdvance, setSelectedCashAdvance] = useState(null);

    useEffect(() => {
        fetchIdentitiesWithSummary();
        fetchCashAdvances();
    }, []);

    const filteredIdentities = identitiesWithSummary?.filter(identity => {
        const matchesSearch = identity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            identity.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            identity.department?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === "all" || identity.type === filterType;
        
        return matchesSearch && matchesType;
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
    const activeIdentities = identitiesWithSummary?.filter(identity => identity.is_active).length || 0;

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

    const filteredCashAdvances = selectedIdentity 
        ? cashAdvances?.filter(cashAdvance => parseInt(cashAdvance.identity_id) === parseInt(selectedIdentity.id)) || []
        : cashAdvances || [];

    const handleIdentitySelect = (identity) => {
        setSelectedIdentity(identity);
        setActiveTab("cash-advances");
    };

    const handlePaymentClick = (cashAdvance) => {
        setSelectedCashAdvance(cashAdvance);
        setShowPaymentsModal(true);
    };

    const handlePaymentSuccess = () => {
        // Refresh cash advances data after payment
        fetchCashAdvances();
        setShowPaymentsModal(false);
        setSelectedCashAdvance(null);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title="Cash Advances Management" />
            
            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="identities" title="Identities">
                    {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FontAwesomeIcon icon={faUser} className="text-primary fs-1 mb-2" />
                            <h5 className="card-title">{totalIdentities}</h5>
                            <p className="card-text text-muted">
                                Total Identities
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
                                Active Identities
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
                                Total Amount
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
                                Outstanding
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
                                <h5 className="mb-0">Quick Actions</h5>
                                <div>
                                    <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => navigate("/user/cash-advance-identities/create")}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Create Identity
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => navigate("/user/cash-advances/create")}
                                    >
                                        <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                                        Create Cash Advance
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
                                            placeholder="Search identities..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col xs={6} md={3} className="mb-2 mb-md-0">
                                    <Form.Select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="employee">Employee</option>
                                        <option value="contractor">Contractor</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Col>
                                <Col xs={6} md={3}>
                                    <div className="text-muted text-center text-md-start">
                                        Showing: {filteredIdentities.length} of {totalIdentities}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Identities List */}
            <Row>
                {filteredIdentities.map((identity) => (
                    <Col md={6} lg={4} key={identity.id} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">{identity.name}</h6>
                                    {identity.employee_id && (
                                        <small className="text-muted">ID: {identity.employee_id}</small>
                                    )}
                                </div>
                                <Badge bg={getTypeBadgeColor(identity.type)}>
                                    {identity.type === 'employee' ? 'Employee' : 
                                     identity.type === 'contractor' ? 'Contractor' : 'Other'}
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    {identity.department && (
                                        <div className="text-muted">
                                            <strong>Department:</strong> {identity.department}
                                        </div>
                                    )}
                                    {identity.phone && (
                                        <div className="text-muted">
                                            <strong>Phone:</strong> {identity.phone}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="row text-center">
                                    <div className="col-4">
                                        <div className="fw-bold text-primary">{identity.total_advances || 0}</div>
                                        <small className="text-muted">Total Advances</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="fw-bold text-info">
                                            {currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, (() => {
                                                const value = parseFloat(identity.total_amount);
                                                return isNaN(value) ? 0 : value;
                                            })())}
                                        </div>
                                        <small className="text-muted">Total Amount</small>
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
                                        <small className="text-muted">Outstanding</small>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Footer className="d-flex justify-content-between">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleIdentitySelect(identity)}
                                >
                                    <FontAwesomeIcon icon={faList} className="me-1" />
                                    View Cash Advances
                                </Button>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => navigate(`/user/cash-advances/create?identity_id=${identity.id}`)}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                                    Create Cash Advance
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
                                    No Identities Found
                                </h5>
                                <p className="text-muted">
                                    Start by creating your first identity to manage cash advances.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate("/user/cash-advance-identities/create")}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                                    Create Identity
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
                </Tab>
                
                <Tab eventKey="cash-advances" title="Cash Advances">
                    {selectedIdentity ? (
                        <div>
                            {filteredCashAdvances.length > 0 ? (
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Header className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
                                                <div className="mb-2 mb-lg-0">
                                                    <h5 className="mb-1">Cash Advances for {selectedIdentity.name}</h5>
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
                                                        <span className="d-none d-sm-inline">Create Cash Advance</span>
                                                        <span className="d-inline d-sm-none">Create</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => setActiveTab("identities")}
                                                    >
                                                        <span className="d-none d-sm-inline">Back to Identities</span>
                                                        <span className="d-inline d-sm-none">Back</span>
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
                                                                    Reference
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
                                                                    Amount
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
                                                                    Paid Amount
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
                                                                    Outstanding
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
                                                                    Status
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
                                                                    Date
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
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                    <tbody>
                                                        {filteredCashAdvances.map((cashAdvance) => {
                                                            const amount = parseFloat(cashAdvance.amount) || 0;
                                                            const paidAmount = parseFloat(cashAdvance.paid_amount) || 0;
                                                            const outstanding = amount - paidAmount;
                                                            const isPaid = cashAdvance.status === 1;
                                                            const statusText = isPaid ? 'Paid' : 'Pending';
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
                                                                                title="Make Payment"
                                                                                className="d-flex align-items-center justify-content-center"
                                                                                style={{ minWidth: '40px', minHeight: '40px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faCreditCard} />
                                                                                <span className="d-none d-lg-inline ms-1">Pay</span>
                                                                            </Button>
                                                                        )}
                                                                        {!isPaid && (
                                                                            <Button
                                                                                variant="outline-warning"
                                                                                size="sm"
                                                                                onClick={() => navigate(`/user/cash-advances/edit/${cashAdvance.id}`)}
                                                                                title="Edit"
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
                                                                                onClick={() => navigate(`/user/cash-advances/delete/${cashAdvance.id}`)}
                                                                                title="Delete"
                                                                                className="d-none d-sm-inline-flex align-items-center justify-content-center"
                                                                                style={{ minWidth: '40px', minHeight: '40px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                            </Button>
                                                                        )}
                                                                        {isPaid && (
                                                                            <span className="text-muted small d-flex align-items-center">
                                                                                <FontAwesomeIcon icon={faCheck} className="me-1 text-success" />
                                                                                Paid
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
                                                <h5 className="text-muted">No Cash Advances Found</h5>
                                                <p className="text-muted">
                                                    This identity doesn't have any cash advances yet.
                                                </p>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => navigate(`/user/cash-advances/create?identity_id=${selectedIdentity.id}`)}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                    Create First Cash Advance
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
                                        <h5 className="text-muted">Select an Identity</h5>
                                        <p className="text-muted">
                                            Please go to the Identities tab and select an identity to view their cash advances.
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={() => setActiveTab("identities")}
                                        >
                                            Go to Identities
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

export default connect(mapStateToProps, { fetchIdentitiesWithSummary, fetchCashAdvances })(CashAdvanceIdentityDashboard);
