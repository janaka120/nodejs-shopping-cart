const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // ** This code use mysql2 to create data from DB
  // const product = new Product(null, title, imageUrl, description, price);
  // product
  //   .save()
  //   .then(() => {
  //     res.redirect('/');
  //   })
  //   .catch(err => console.log(err));

  // ** Sequelize to create data
  console.log("req.user.id >>>", req.user.id);
  Product.create({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user.id
  }).then((result) => {
    console.log("result >>>>", result);
    res.redirect('/');
  }).catch((err) => {
    console.log("Product create err >>>", err);
  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user.getProducts({where: {id: prodId}}) // pick the product created by current login user
  // Product.findByPk(prodId)
  .then((products) => {
    const product = products[0];
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  }).catch((err) => {
    console.log("update product err >>>", err)
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findByPk(prodId).then((product) => {
    product.title = updatedTitle
    product.price = updatedPrice
    product.imageUrl = updatedImageUrl
    product.description = updatedDesc
    return product.save();
  }).then((result) => {
    res.redirect('/admin/products');
  }).catch((err) => {
    console.log("update product err >>>", err)
  });
};

exports.getProducts = (req, res, next) => {
  // Product.fetchAll(products => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products'
  //   });
  // });
  req.user.getProducts()
  // Product.findAll()
  .then((products) => {
    res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
        });
  }).catch((err) => {
    console.log("err get all products");
  })
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId).then((product) => {
    return product.destroy();
  }).then((result) => {
    res.redirect('/admin/products');
  }).catch((err) => {
    console.log("delete product err >>>", err)
  });
};
