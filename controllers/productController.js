const { model } = require("mongoose");
const path = require("path");
const productModel = require("../models/productModel");
const fs = require("fs");

const createProduct = async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  // const { firstName, lastName, email, password } = req.body;
  //destructuring incomming data
  const { productName, productPrice, productCategory, productDescription } =
    req.body;

  if (
    !productName ||
    !productPrice ||
    !productCategory ||
    !productDescription
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are requird",
    });
  }

  //check product image
  if (!req.files || !req.files.productImage) {
    return res.status(400).json({
      success: false,
      message: "Image not found",
    });
  }
  const { productImage } = req.files;

  //uploading
  //1. generate unique name for each file
  const imageName = `${Date.now()}-${productImage.name}`;
  //2. define specific path
  const imageUploadPath = path.join(
    __dirname,
    `../public/products/${imageName}`,
  );
  //3. upload to that path (await | trycatch)
  try {
    //try move the image into folder

    await productImage.mv(imageUploadPath);

    //save to database
    const newProduct = new productModel({
      productName: productName,
      productPrice: productPrice,
      productCategory: productCategory,
      productDescription: productDescription,
      productImage: imageName,
    });
    const product = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product  Created",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: " Internal server error",
      error: error,
    });
  }
};

//fetch all products
const getAllProducts = async (req, res) => {
  //#. try catch
  try {
    //1. Find all the products (Await)
    const products = await productModel.find({});
    //2. send response
    res.status(201).json({
      success: true,
      message: "Product fetched successfully",
      products: products,
    });
  } catch (error) {
    console.log(error);
  }
};

const getProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// update product
const updateProduct = async (req, res) => {
  try {
    // if there is files, upload the new image, delete the old image
    if (req.files && req.files.productImage) {
      const { productImage } = req.files;
      const imageName = `${Date.now()}-${productImage.name}`;
      const imageUploadPath = path.join(
        __dirname,
        `../public/products/${imageName}`,
      );
      await productImage.mv(imageUploadPath);
      req.body.productImage = imageName;
    }

    // find product image name
    const oldImageName = await productModel
      .findById(req.params.id)
      .select("productImage");

    // delete the old product image
    if (req.body.productImage) {
      fs.unlinkSync(
        path.join(__dirname, `../public/products/${oldImageName.productImage}`),
      );
    }

    // update the product
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete product
const deleteProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
