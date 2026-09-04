import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import path from 'path';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        const productData = JSON.parse(req.body.productData);
        const files = req.files || [];
        const images = files.filter((file) => file.fieldname === 'images');

        if (images.length === 0 && !files.some((file) => file.fieldname.startsWith('variantImage_'))) {
            return res.status(400).json({ success: false, message: 'Please upload at least one product image before publishing.' });
        }

        let imagesUrl = [];
        const variantFiles = files.filter((file) => file.fieldname.startsWith('variantImage_'));

        // If Cloudinary configured, upload; otherwise use local uploads URLs
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET) {
            imagesUrl = await Promise.all(images.map(async (item) =>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url;
            }));
        } else {
            // map to statically served uploads (server must serve /uploads)
            const base = process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`;
            imagesUrl = images.map(item => `${base}/uploads/${path.basename(item.path)}`);
        }

        const variantImageUrls = {};
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET) {
            await Promise.all(variantFiles.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                variantImageUrls[item.fieldname] = result.secure_url;
            }));
        } else {
            const base = process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`;
            variantFiles.forEach((item) => {
                variantImageUrls[item.fieldname] = `${base}/uploads/${path.basename(item.path)}`;
            });
        }
        if (imagesUrl.length === 0) imagesUrl = Object.values(variantImageUrls);

        const variants = Array.isArray(productData.variants)
            ? productData.variants.map((variant) => ({
                ...variant,
                image: variant.imageField ? (variantImageUrls[variant.imageField] || '') : '',
            }))
            : productData.variants;
        delete productData.variants;

        const created = await Product.create({ ...productData, variants, images: imagesUrl });
        res.json({success: true, message: "Product Added", product: created});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get Product : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({success: true, products});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get Single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        res.json({success: true, product});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, quantity, variantUnit } = req.body;
        if (quantity < 0) {
            return res.json({ success: false, message: "Quantity cannot be negative" });
        }

        const product = await Product.findById(id);
        if (!product) return res.json({ success: false, message: "Product not found" });

        if (variantUnit && Array.isArray(product.variants) && product.variants.length) {
            const variant = product.variants.find((item) => item.unit === variantUnit);
            if (!variant) return res.json({ success: false, message: "Product variant not found" });
            variant.quantity = quantity;
            variant.inStock = quantity > 0;
            product.inStock = product.variants.some((item) => item.inStock);
            const updatedProduct = await product.save();
            return res.json({ success: true, message: "Variant stock updated", product: updatedProduct });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, { quantity, inStock: quantity > 0 }, { new: true });

        res.json({ success: true, message: "Stock Updated", product: updatedProduct });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update product fields (name, description (array), price, offerPrice, category)
export const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, offerPrice, category, brand, weight, unit } = req.body;
        if(!id) return res.json({ success: false, message: 'Product id required' });

        const update = {};
        if(name) update.name = name;
        if(description) update.description = Array.isArray(description) ? description : (description ? [description] : []);
        if(price !== undefined) update.price = Number(price);
        if(offerPrice !== undefined) update.offerPrice = Number(offerPrice);
        if(category) update.category = Array.isArray(category) ? category : [category];
        if(brand !== undefined) update.brand = brand;
        if(weight !== undefined) update.weight = Number(weight);
        if(unit !== undefined) update.unit = unit;

        const updatedProduct = await Product.findByIdAndUpdate(id, update, { new: true });
        res.json({ success: true, message: 'Product updated', product: updatedProduct });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        if(!id) return res.json({ success: false, message: 'Product id required' });

        const product = await Product.findByIdAndDelete(id);
        if(!product) return res.json({ success: false, message: 'Product not found' });

        // If images were stored locally, attempt to remove files
        try{
            const fs = await import('fs');
            const path = await import('path');
            const uploadBase = process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`;
            if(Array.isArray(product.images)){
                for(const img of product.images){
                    if(typeof img === 'string' && img.startsWith(`${uploadBase}/uploads/`)){
                        const filename = path.basename(img);
                        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
                        if(fs.existsSync(filepath)){
                            fs.unlinkSync(filepath);
                        }
                    }
                }
            }
        }catch(e){
            console.log('Failed to delete local image files:', e.message);
        }

        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};