const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => {console.log('getProducts err >>', err)});
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.fetchById(prodId).then(product => {
    console.log("getProduct result >>>", product);
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  }).catch(err => {
    console.log("getProduct err >>>", err);
  })
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
};

exports.getIndex = (req, res, next) => {
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
  Product.fetchAll()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => {console.log('shop getIndex err >>', err)});
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
  req.user.getCart()
  .then((products) => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  })
  .catch(err => {
    console.log("getCart err >>", err)
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
  Product.fetchById(prodId).then(product => {
      return req.user.addToCart(product);
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    console.log("postCart error", err);
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
  req.user.deleteItemFromCart(prodId)
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
  req.user.getOrders()
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  }).catch(err => {
    console.log("fetch orders err >>>", err);
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
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
  req.user.addOrder()
  .then(result => {
    res.redirect('/orders');
  }).catch(err => {
      console.log('post order err >>>>', err)
  })
}
