import React, { useState } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import TopupRequestForm from "./TopupRequestForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const EditTopupRequest = (props) => {
    const { topupRequest, editTopupRequest } = props;
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const editTopupRequestData = (formValue) => {
        setIsLoading(true);
        editTopupRequest(id, formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("topup-request.edit.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <TopupRequestForm
                                onSubmit={editTopupRequestData}
                                isLoading={isLoading}
                                topupRequest={topupRequest}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { topupRequest } = state;
    return { topupRequest };
};

export default connect(mapStateToProps, {
    // editTopupRequest
})(EditTopupRequest);