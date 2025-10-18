import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import { editDigitalProduct, fetchDigitalProduct } from "../../store/action/digitalProductAction";
import DigitalProductForm from "./DigitalProductForm";
import HeaderTitle from "../header/HeaderTitle";
import { getFormattedMessage } from "../../shared/sharedMethod";

const EditDigitalProduct = (props) => {
      const { editDigitalProduct, fetchDigitalProduct, digitalProducts } = props;
     const navigate = useNavigate();
     const { id } = useParams();

     useEffect(() => {
         console.log('EditDigitalProduct: Fetching digital product with ID:', id);
         fetchDigitalProduct(id);
     }, [id, fetchDigitalProduct]);

     // Handle JSON:API format - extract attributes if present
     const productData = digitalProducts?.[0]?.attributes || digitalProducts?.[0];
     console.log('EditDigitalProduct - productData:', productData);

     const editDigitalProductData = (formValue) => {
         editDigitalProduct(id, formValue, navigate);
     };

     return (
         <MasterLayout>
             <HeaderTitle
                 title={getFormattedMessage("digital-product.edit.title")}
                 to="/user/digital-products"
             />
             <DigitalProductForm
                 editDigitalProductData={editDigitalProductData}
                 id={id}
                 digitalProduct={productData ? [productData] : []}
             />
         </MasterLayout>
     );
 };

 const mapStateToProps = (state) => {
     const { digitalProducts } = state;
     return { digitalProducts };
 };

export default connect(mapStateToProps, { editDigitalProduct, fetchDigitalProduct })(EditDigitalProduct);