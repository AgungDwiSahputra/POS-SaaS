import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { getFormattedMessage } from "../../../shared/sharedMethod";
import DigitalProductForm from "./DigitalProductForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    editDigitalProduct,
    fetchDigitalProduct,
    clearDigitalProduct,
} from "../../../store/action/digitalProductAction";

const EditDigitalProduct = ({
    digitalProduct,
    isSaving,
    isLoading,
    editDigitalProduct,
    fetchDigitalProduct,
    clearDigitalProduct,
}) => {
    console.log('EditDigitalProduct - Redux state:', {
        digitalProduct,
        isSaving,
        isLoading
    });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        console.log('EditDigitalProduct - useEffect triggered with ID:', id);

        // Always clear previous product data when ID changes
        console.log('EditDigitalProduct - clearing previous product data');
        clearDigitalProduct();

        if (id) {
            console.log('EditDigitalProduct - fetching product with ID:', id);
            fetchDigitalProduct(id);
        } else {
            console.warn('EditDigitalProduct - no ID provided');
        }
    }, [id, fetchDigitalProduct, clearDigitalProduct]);

    const editDigitalProductData = (formValue) => {
        console.log('EditDigitalProduct - editing product with ID:', id);
        console.log('EditDigitalProduct - form values:', formValue);
        console.log('EditDigitalProduct - current digitalProduct state:', digitalProduct);
        console.log('EditDigitalProduct - formattedDigitalProduct:', formattedDigitalProduct);
        console.log('EditDigitalProduct - form values types:', {
            name: typeof formValue.name,
            code: typeof formValue.code,
            product_code: typeof formValue.product_code,
            category: typeof formValue.category,
            cost_price: typeof formValue.cost_price,
            sell_price: typeof formValue.sell_price,
            provider_code: typeof formValue.provider_code,
            description: typeof formValue.description,
            is_active: typeof formValue.is_active,
        });

        // Validate required fields before sending to backend
        const errors = [];

        if (!formValue.name || formValue.name.trim() === '') {
            errors.push('Nama produk harus diisi');
        }
        if (!formValue.code || formValue.code.trim() === '') {
            errors.push('Kode produk harus diisi');
        }
        if (!formValue.product_code || formValue.product_code.trim() === '') {
            errors.push('Kode produk eksternal harus diisi');
        }
        if (!formValue.category || formValue.category.trim() === '') {
            errors.push('Kategori harus dipilih');
        }
        if (!formValue.cost_price || parseFloat(formValue.cost_price) < 0) {
            errors.push('Harga beli harus diisi dengan nilai positif');
        }
        if (!formValue.sell_price || parseFloat(formValue.sell_price) < 0) {
            errors.push('Harga jual harus diisi dengan nilai positif');
        }

        if (errors.length > 0) {
            console.error('EditDigitalProduct - validation errors:', errors);
            return;
        }

        // Ensure all required fields are present and properly formatted
        const completeFormValue = {
            name: formValue.name.trim(),
            code: formValue.code.trim().toUpperCase(),
            product_code: formValue.product_code.trim(),
            category: formValue.category,
            cost_price: parseFloat(formValue.cost_price) || 0,
            sell_price: parseFloat(formValue.sell_price) || 0,
            provider_code: (formValue.provider_code || '').trim(),
            description: (formValue.description || '').trim(),
            is_active: formValue.is_active !== undefined ? formValue.is_active : true,
            // Add missing fields that backend expects
            product_data: null,
            sort_order: 0,
        };

        console.log('EditDigitalProduct - sending data to backend:', completeFormValue);

        editDigitalProduct(id, completeFormValue, navigate);
    };

    const formattedDigitalProduct = useMemo(() => {
        console.log('EditDigitalProduct - formatting digitalProduct:', digitalProduct);
        console.log('EditDigitalProduct - digitalProduct type:', typeof digitalProduct);
        console.log('EditDigitalProduct - digitalProduct keys:', digitalProduct ? Object.keys(digitalProduct) : 'null');

        // Handle case where digitalProduct is the actual product data (not wrapped in data property)
        let productData = digitalProduct;

        // If digitalProduct has a 'data' property, use that (API response structure)
        if (digitalProduct && digitalProduct.data && typeof digitalProduct.data === 'object') {
            productData = digitalProduct.data;
            console.log('EditDigitalProduct - using data property:', productData);
        }

        // If no valid product data, return null
        if (!productData || (!productData.id && !productData.name)) {
            console.warn('EditDigitalProduct - no valid product data found:', productData);
            return null;
        }

        console.log('EditDigitalProduct - final productData:', productData);
        console.log('EditDigitalProduct - productData data types:', {
            id: typeof productData.id,
            name: typeof productData.name,
            code: typeof productData.code,
            product_code: typeof productData.product_code,
            category: typeof productData.category,
            cost_price: typeof productData.cost_price,
            sell_price: typeof productData.sell_price,
            provider_code: typeof productData.provider_code,
            description: typeof productData.description,
            is_active: typeof productData.is_active,
        });

        // Ensure all required fields are present and properly formatted
        return {
            id: productData.id,
            name: productData.name || '',
            code: productData.code || '',
            product_code: productData.product_code || '',
            category: productData.category || '',
            cost_price: productData.cost_price || 0,
            sell_price: productData.sell_price || 0,
            provider_code: productData.provider_code || '',
            description: productData.description || '',
            is_active: productData.is_active !== undefined ? productData.is_active : true,
            created_at: productData.created_at,
            updated_at: productData.updated_at,
        };
    }, [digitalProduct]); // Depend on full digitalProduct object

    // Show loading state while fetching data
    if (isLoading && (!digitalProduct || Object.keys(digitalProduct).length === 0)) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Memuat data produk...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    // Show error state if no data found after loading
    if (!isLoading && digitalProduct === null) {
        console.error('EditDigitalProduct - Product not found after loading:', { id, digitalProduct, isLoading });
        return (
            <MasterLayout>
                <TopProgressBar />
                <TabTitle title="Produk Tidak Ditemukan" />
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                                <h5>Produk tidak ditemukan</h5>
                                <p className="text-muted">Produk dengan ID {id} tidak tersedia atau telah dihapus.</p>
                                <div className="mt-3">
                                    <button
                                        className="btn btn-primary me-2"
                                        onClick={() => {
                                            console.log('EditDigitalProduct - navigating to products list');
                                            window.location.href = "#/user/digital/digital-products";
                                        }}
                                    >
                                        Kembali ke Daftar Produk
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            console.log('EditDigitalProduct - going back');
                                            window.history.back();
                                        }}
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    // Show error state if formattedDigitalProduct is null (after loading is complete)
    if (!isLoading && !formattedDigitalProduct && digitalProduct !== null) {
        console.error('EditDigitalProduct - Formatted product data is null:', { digitalProduct, formattedDigitalProduct, isLoading });
        return (
            <MasterLayout>
                <TopProgressBar />
                <TabTitle title="Data Produk Tidak Valid" />
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                                <h5>Data produk tidak valid</h5>
                                <p className="text-muted">Data produk tidak dapat diproses untuk diedit. Kemungkinan produk tidak ditemukan atau data tidak lengkap.</p>
                                <div className="mt-3">
                                    <button
                                        className="btn btn-primary me-2"
                                        onClick={() => {
                                            console.log('EditDigitalProduct - navigating to products list from invalid data');
                                            window.location.href = "#/user/digital/digital-products";
                                        }}
                                    >
                                        Kembali ke Daftar Produk
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            console.log('EditDigitalProduct - going back from invalid data');
                                            window.history.back();
                                        }}
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={getFormattedMessage("digital-product.edit.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalProductForm
                                key={`product-form-${id}-${formattedDigitalProduct?.updated_at || 'new'}`}
                                onSubmit={editDigitalProductData}
                                isLoading={isSaving || isLoading}
                                digitalProduct={formattedDigitalProduct}
                                isEditMode={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { digitalProducts: digitalProductsState = {} } = state;
    return {
        digitalProduct: digitalProductsState.digitalProduct || null,
        isLoading: digitalProductsState.isLoading || false,
        isSaving: digitalProductsState.isSaving || false,
    };
};

export default connect(mapStateToProps, {
    editDigitalProduct,
    fetchDigitalProduct,
    clearDigitalProduct,
})(EditDigitalProduct);
