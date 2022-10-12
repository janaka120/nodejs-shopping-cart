const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  if(!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: '',
    hasErrors: false,
    product: {
      title: '',
      imageUrl: '',
      price: 0,
      description: '',
    },
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.session.user._id;
  // ** This code use mysql2 to create data from DB
  // const product = new Product(null, title, imageUrl, description, price);
  // product
  //   .save()
  //   .then(() => {
  //     res.redirect('/');
  //   })
  //   .catch(err => console.log(err));

  // ** Sequelize to create data
  // console.log("req.user.id >>>", req.user.id);
  // Product.create({
  //   title: title,
  //   imageUrl: imageUrl,
  //   price: price,
  //   description: description,
  //   userId: req.user.id
  // }).then((result) => {
  //   console.log("result >>>>", result);
  //   res.redirect('/');
  // }).catch((err) => {
  //   console.log("Product create err >>>", err);
  // })

  // mongo db create new produt
  // const product = new Product(title, price, description, imageUrl, userId);
  // product.save()
  // .then(result => {
  //   console.log("postAddProduct result >>", result);
  //   res.redirect('/');
  // })
  // .catch(err => {
  //   console.log('postAddProduct err >>>', err)
  // });

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasErrors: errors.array().length > 0,
        errorMessage: errors.array()[0].msg,
        product: {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description,
        },
        validationErrors: errors.array(),
    })
  }
  // mongoose code base
  const product = new Product({title, price, description, imageUrl, userId});
  product.save() // save method by default support by mongoose
  .then(result => {
    console.log("postAddProduct result >>", result);
    res.redirect('/');
  })
  .catch(err => {
    console.log('postAddProduct err >>>', err);

    // *** hable error method 1 - redirect to same page with error msg
    // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
    //   path: '/admin/add-product',
    //   editing: false,
    //   hasErrors: true,
    //   errorMessage: 'Database operation fail',
    //   product: {
    //     title: title,
    //     imageUrl: imageUrl,
    //     price: price,
    //     description: description,
    //   },
    //   validationErrors: [],
    // });

    // *** hable error method 2 - redirect to new page with error msg
    res.redirect('/500');

    // *** hable error method 3 - pass error object to next()
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error); // if we pass error pbject like this, it'll skip executing other middleeare and just call to error handling middleware
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  // ** This code used Sequelize
  // req.user.getProducts({where: {id: prodId}}) // pick the product created by current login user
  // // Product.findByPk(prodId)
  // .then((products) => {
  //   const product = products[0];
  //   if (!product) {
  //     return res.redirect('/');
  //   }
  //   res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: editMode,
  //     product: product
  //   });
  // }).catch((err) => {
  //   console.log("update product err >>>", err)
  // });


  // ** This code used mongo db
  // Product.fetchById(prodId)
  // .then((product) => {
  //   if (!product) {
  //     return res.redirect('/');
  //   }
  //   res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: editMode,
  //     product: product
  //   });
  // }).catch((err) => {
  //   console.log("update product err >>>", err)
  // });


  // ** This code used mongoose db
  Product.findById(prodId)
  .then((product) => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      errorMessage: '',
      oldInput: {
        title: '',
        imageUrl: '',
        price: 0,
        description: '',
      },
      validationErrors: [],
    });
  }).catch((err) => {
    console.log("update product err >>>", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  // ** This code used Sequelize
  // Product.findByPk(prodId).then((product) => {
  //   product.title = updatedTitle
  //   product.price = updatedPrice
  //   product.imageUrl = updatedImageUrl
  //   product.description = updatedDesc
  //   return product.save();
  // }).then((result) => {
  //   res.redirect('/admin/products');
  // }).catch((err) => {
  //   console.log("update product err >>>", err)
  // });


  // ** This code used mongodb
  // const proObj = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageUrl);
  // proObj.update(prodId).then((result) => {
  //   res.redirect('/admin/products');
  // }).catch((err) => {
  //   console.log("update product err >>>", err)
  // });

  
  console.log("update prodId >>", prodId);
  // ** This code used mongoose
  Product.findById(prodId)
    .then((product) => {
      if(req.user._id.toString() !== product.userId.toString()) {
        return res.redirect('/');
      }
      const errors = validationResult(req);
      if(!errors.isEmpty()) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            errorMessage: errors.array()[0].msg,
            oldInput: {
              title: updatedTitle,
              imageUrl: updatedImageUrl,
              price: updatedPrice,
              description: updatedDesc,
            },
            product: product,
            validationErrors: errors.array(),
        })
      }else {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        console.log('Update successfully.')
        return product.save()
        .then(result => {
          res.redirect('/admin/products');
        });
      }
    }).catch((err) => {
      console.log("update product err >>>", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
  
  // ** This code used Sequelize
  // req.user.getProducts()
  // // Product.findAll()
  // .then((products) => {
  //   res.render('admin/products', {
  //         prods: products,
  //         pageTitle: 'Admin Products',
  //         path: '/admin/products'
  //       });
  // }).catch((err) => {
  //   console.log("err get all products");
  // })

  // *** mongodb code base
  // Product.fetchAll()
  // .then(products => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products'
  //   });
  // }).catch(err => {
  //   console.log("admon getProducts err >>>", err);
  // })


  // *** mongoose code base
  Product.find({userId: req.user._id})
    // .populate('userId', 'name') // in mongoose can populate to fetch complete User schema
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    }).catch(err => {
      console.log("admon getProducts err >>>", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postDeleteProduct = (req, res, next) => {
  // ** This code used Sequelize
  const prodId = req.body.productId;
  // Product.findByPk(prodId).then((product) => {
  //   return product.destroy();
  // }).then((result) => {
  //   res.redirect('/admin/products');
  // }).catch((err) => {
  //   console.log("delete product err >>>", err)
  // });

  // *** mongo Db
  // Product.deleteById(prodId)
  // .then((result) => {
  //   res.redirect('/admin/products');
  // }).catch((err) => {
  //   console.log("delete product err >>>", err)
  // });


  // *** mongoose Db
  Product.deleteOne({_id: prodId, userId: req.user._id})
  .then((result) => {
    res.redirect('/admin/products');
  }).catch((err) => {
    console.log("delete product err >>>", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
