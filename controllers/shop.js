const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = Number(req.query.page) || 1;
  let totalItems;
  // *** mongodb code base
  // Product.fetchAll()
  // .then(products => {
  //   res.render('shop/product-list', {
  //     prods: products,
  //     pageTitle: 'All Products',
  //     path: '/products'
  //   });
  // })
  // .catch(err => {console.log('getProducts err >>', err)});

  // *** mongoose code base
  Product.find().countDocuments().then(totalProducts => {
    totalItems = totalProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE) // pagination
    .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      totalProducts: totalItems,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      nextPage: page + 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    console.log('getProducts err >>', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // *** mongodb code base
  // Product.fetchById(prodId).then(product => {
  //   console.log("getProduct result >>>", product);
  //   res.render('shop/product-detail', {
  //     product: product,
  //     pageTitle: product.title,
  //     path: '/products'
  //   });
  // }).catch(err => {
  //   console.log("getProduct err >>>", err);
  // });

  // ** Sequelize to create data
  // Product.findByPk(prodId)
  //   .then((product) => {
  //     res.render('shop/product-detail', {
  //       product: product,
  //       pageTitle: product.title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));

  // *** mongoose code base
  Product.findById(prodId) // `findById()` given by mongoose 
  .then((product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products',
    });
  })
  .catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getIndex = (req, res, next) => {
  const page = Number(req.query.page) || 1;
  let totalItems;
  // ** Sequelize to create data
  // Product.findAll().then((result) => {
  //   res.render('shop/index', {
  //           prods: result,
  //           pageTitle: 'Shop',
  //           path: '/'
  //         });
  // }).catch((err) => {
  //   console.log("err get all products");
  // })

  // *** mongodb
  // Product.fetchAll()
  // .then(products => {
  //   res.render('shop/index', {
  //     prods: products,
  //     pageTitle: 'Shop',
  //     path: '/'
  //   });
  // })
  // .catch(err => {console.log('shop getIndex err >>', err)});

  // *** mongoose code base
  Product.find().countDocuments().then(totalProducts => {
    totalItems = totalProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE) // pagination
    .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      totalProducts: totalItems,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      nextPage: page + 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    console.log('getProducts err >>', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCart = (req, res, next) => {
  // ** Sequelize to create data
  // req.user.getCart().then((cart) => {
  //   // console.log("result >>>>", cart)
  //   return cart.getProducts().then(cartProducts => {
  //     console.log("cartProducts **>>>>", cartProducts);
  //     res.render('shop/cart', {
  //             path: '/cart',
  //             pageTitle: 'Your Cart',
  //             products: cartProducts
  //           });
  //   }).catch((err) => {
  //     console.log("err >>>", err);
  //   })
  // }).catch((err) => {
  //   console.log("getcart err >>>", err);
  // });

  // ** Mongo db to create cart
  // req.user.getCart()
  // .then((products) => {
  //   res.render('shop/cart', {
  //     path: '/cart',
  //     pageTitle: 'Your Cart',
  //     products: products
  //   });
  // })
  // .catch(err => {
  //   console.log("getCart err >>", err)
  // });


  // ** Mongoose db to get cart
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => {
      console.log("getCart err >>", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // *** store data in file 
  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });

  // ** Sequelize to create data
  // let fetchCart;
  // let newQuantity = 1;
  // req.user.getCart().then((cart) => {
  //   fetchCart = cart;
  //   return cart.getProducts({where: {id: prodId}});
  // }).then((products) => {
  //   let product
  //   if(products.length > 0) {
  //     product = products[0]
  //   }
  //   if(product) {
  //     const oldQuantity = product.cartItem.quantity;
  //     newQuantity = oldQuantity + 1;
  //     return product;
  //   }
  //     return Product.findByPk(prodId);
  //   }).then((product) => {
  //     return fetchCart.addProduct(product, {through: {quantity: newQuantity}});
  // }).then(() => {
  //   res.redirect('/cart');
  // })
  // .catch((err) => {
  //   console.log("post cart err>>", err);
  // });

  // ** Mongo db to create cart
  // Product.fetchById(prodId).then(product => {
  //     return req.user.addToCart(product);
  // }).then(result => {
  //   res.redirect('/cart');
  // }).catch(err => {
  //   console.log("postCart error", err);
  // });


  // ** Mongoose db to create cart
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    console.log("postCart error", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // ** Sequelize to create data
  // req.user.getCart().then(cart => {
  //   return cart.getProducts({where: {id: prodId}});
  // }).then((products) => {
  //   const product = products[0];
  //   return product.cartItem.destroy();
  // }).then(result => {
  //   res.redirect('/cart');
  // }).catch(err => {
  //   console.log('err delete item in cart >>', err)
  // });

  // ** storage used as file
  // Product.findById(prodId, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect('/cart');
  // });

  // ** Mongo db to create cart
  // req.user.deleteItemFromCart(prodId)
  // .then(result => {
  //   console.log('post Cart Delete Product result >>', result);
  //   res.redirect('/cart');
  // }).catch(err => {
  //   console.log('post Cart Delete Product err >>', err);
  //   res.redirect('/cart');
  // })


  // ** Mongoose db to create cart
  req.user.removeFromCart(prodId)
  .then(result => {
    console.log('post Cart Delete Product result >>', result);
    res.redirect('/cart');
  }).catch(err => {
    console.log('post Cart Delete Product err >>', err);
    res.redirect('/cart');
  })
};

exports.getOrders = (req, res, next) => {
  // ** Sequelize to create data
  // req.user.getOrders({include: ['products']})
  // .then(orders => {
  //   res.render('shop/orders', {
  //     path: '/orders',
  //     pageTitle: 'Your Orders',
  //     orders: orders
  //   });
  // }).catch(err => {
  //   console.log("fetch orders err >>>", err);
  // });

  // mongo db
  // req.user.getOrders()
  // .then(orders => {
  //   res.render('shop/orders', {
  //     path: '/orders',
  //     pageTitle: 'Your Orders',
  //     orders: orders
  //   });
  // }).catch(err => {
  //   console.log("fetch orders err >>>", err);
  // });


  // mongoose db
  Order.find({'user.userId': req.session.user._id})
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
    });
  }).catch(err => {
    console.log("fetch orders err >>>", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

exports.postOrder = (req, res, next) => {
  // ** Sequelize to create data
  // let fetchedCart;
  // req.user.getCart().then(cart => {
  //   fetchedCart = cart;
  //   return cart.getProducts();
  // }).then(products => {
  //   return req.user.createOrder().then((order) => {
  //     order.addProducts(products.map(product => {
  //       product.orderItem = {quantity: product.cartItem.quantity};
  //       return product
  //     }))
  //   });
  // }).then(result => {
  //   return fetchedCart.setProducts(null);
  // }).then((result) => {
  //   res.redirect('/orders');
  // }).catch((err) => {
  //   console.log('post order err >>>>', err)
  // })
  
  // mongo db
  // req.user.addOrder()
  // .then(result => {
  //   res.redirect('/orders');
  // }).catch(err => {
  //     console.log('post order err >>>>', err)
  // })

  // ** Mongoose db to get cart
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map(item => {
        return {
          quantity: item.quantity,
          product: {...item.productId._doc }
        }
      });
      const order = new Order({products: products, user: {userId: user._id, email: user.email}});
      return order.save(); // save method by default support by mongoose
    })
    .then(result => {
      console.log("post Order success!");
      req.user.cart.items = [];
      return req.user.save();
    })
    .then(() => {
      console.log("user cart update success");
      res.redirect('/orders');
    })
    .catch(err => {
      console.log("postOrder err >>", err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}


exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then(order => {
      if(!order) {
        return next(new Error('No order found'))
      }
      if(order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName =  'invoice-' + orderId + '.pdf';
      const invoicePath =  path.join('.','data', 'invoices', invoiceName);

      // generate pdf
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=""' + invoiceName + '"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('---------------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price; 
        pdfDoc.text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
      })
      pdfDoc.text('-----');
      pdfDoc.fontSize(20).text('Total price: $' + totalPrice);

      pdfDoc.end();
      // method I
      // fs.readFile(invoicePath, (err, data) => {
      //   if(err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', 'inline; filename=""' + invoiceName + '"');
      //   res.send(data);
      // })

      // method II - stream pdf data onthefly
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename=""' + invoiceName + '"');
      // file.pipe(res);
    }).catch(err => {
      console.log("err >>", err);
      next(err)
    });
}