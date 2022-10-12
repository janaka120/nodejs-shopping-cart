const path = require('path');
const { check, body } = require('express-validator/check');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', [
    body('title', 'Please enter valid title')
        .isString()
        .notEmpty()
        .isLength({min: 3, max: 15})
        .trim(),
    body('imageUrl', 'Please enter valid image url')
        .isURL()
        .notEmpty()
        .trim(),
    body('price', 'Please enter valid price')
        .isDecimal()
        .notEmpty(),
    body('description', 'Please enter valid description')
        .isString()
        .notEmpty()
        .isLength({min: 3, max: 300})
        .trim()
    ] ,isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title', 'Please enter valid title')
        .isString()
        .notEmpty()
        .isLength({min: 3, max: 15})
        .trim(),
    body('imageUrl', 'Please enter valid image url')
        .isURL()
        .notEmpty()
        .trim(),
    body('price', 'Please enter valid price')
        .isDecimal()
        .notEmpty(),
    body('description', 'Please enter valid description')
        .isString()
        .notEmpty()
        .isLength({min: 3, max: 300})
        .trim()
    ],
    isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
