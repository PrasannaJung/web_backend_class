const router = require("express").Router();
const productController = require("../controllers/productController");
const { authGuard, adminGuard } = require("../middleware/authGuard");

router.post("/create", productController.createProduct);

//fetch all
router.get("/get_all_products", authGuard, productController.getAllProducts);

// fetch single product
router.get("/get_product/:id", productController.getProduct);

// delete product
router.delete(
  "/delete_product/:id",
  authGuard,
  adminGuard,
  productController.deleteProduct,
);

// update product
router.put(
  "/update_product/:id",
  authGuard,
  adminGuard,
  productController.updateProduct,
);

//exporting
module.exports = router;
