const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  res.render('shop/product-list', {
    prods: [],
    pageTitle: 'All Products',
    path: '/products'
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then((result) => {
    res.render('shop/index', {
            prods: result,
            pageTitle: 'Shop',
            path: '/'
          });
  }).catch((err) => {
    console.log("err get all products");
  })
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then((cart) => {
    // console.log("result >>>>", cart)
    return cart.getProducts().then(cartProducts => {
      console.log("cartProducts **>>>>", cartProducts);
      res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: cartProducts
            });
    }).catch((err) => {
      console.log("err >>>", err);
    })
  }).catch((err) => {
    console.log("getcart err >>>", err);
  })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });
  let fetchCart;
  let newQuantity = 1;
  req.user.getCart().then((cart) => {
    fetchCart = cart;
    return cart.getProducts({where: {id: prodId}});
  }).then((products) => {
    let product
    if(products.length > 0) {
      product = products[0]
    }
    if(product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
      return Product.findByPk(prodId);
    }).then((product) => {
      return fetchCart.addProduct(product, {through: {quantity: newQuantity}});
  }).then(() => {
    res.redirect('/cart');
  })
  .catch((err) => {
    console.log("post cart err>>", err);
  })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart().then(cart => {
    return cart.getProducts({where: {id: prodId}});
  }).then((products) => {
    const product = products[0];
    return product.cartItem.destroy();
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    console.log('err delete item in cart >>', err)
  });
  // Product.findById(prodId, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect('/cart');
  // });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
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
  let fetchedCart;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  }).then(products => {
    return req.user.createOrder().then((order) => {
      order.addProducts(products.map(product => {
        product.orderItem = {quantity: product.cartItem.quantity};
        return product
      }))
    });
  }).then(result => {
    return fetchedCart.setProducts(null);
  }).then((result) => {
    res.redirect('/orders');
  }).catch((err) => {
    console.log('post order err >>>>', err)
  })
}
