const express = require("express");
const path = require("path");
const productsController = require('../controllers/products');

const router = express.Router();

const products = [];

// /admin/add-product => GET
router.get("/add-product", productsController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", productsController.postAddProducts);

module.exports = router;
