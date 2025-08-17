#!/usr/bin/env python3
import os
import subprocess
import argparse

# ==============================================================================
# FILE CONTENTS
# ==============================================================================

# --- Backend Files ---

BACKEND_PACKAGE_JSON = """
{
  "name": "backend",
  "version": "1.0.0",
  "description": "E-commerce API",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "nodemon": "^3.0.2",
    "prettier": "^3.1.1"
  }
}
"""

SERVER_JS = """
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import errorHandler from './utils/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
"""

DB_JS = """
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
"""

AUTH_MIDDLEWARE_JS = """
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
"""

USER_MODEL_JS = """
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
"""

PRODUCT_MODEL_JS = """
import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
"""

ORDER_MODEL_JS = """
import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: { id: String, status: String, update_time: String, email_address: String },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
"""

AUTH_ROUTES_JS = """
import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
"""

PRODUCTS_ROUTES_JS = """
import express from 'express';
import {
  getProducts,
  getProductById,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
"""

ORDERS_ROUTES_JS = """
import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

export default router;
"""

AUTH_CONTROLLER_JS = """
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch(error) {
    next(error);
  }
};
"""

PRODUCT_CONTROLLER_JS = """
import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};
"""

ORDER_CONTROLLER_JS = """
import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
export const addOrderItems = async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  try {
    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });
      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch(error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch(error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch(error) {
    next(error);
  }
};
"""

ERROR_HANDLER_JS = """
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;
"""

BACKEND_ENV_EXAMPLE = """
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/myshop
JWT_SECRET=yourjwtsecretkey
"""

# --- Frontend Files ---

FRONTEND_PACKAGE_JSON = """
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "format": "prettier --write ."
  },
  "dependencies": {
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
"""

INDEX_HTML = """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Shop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

TAILWIND_CONFIG_JS = """
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"""

POSTCSS_CONFIG_JS = """
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""

MAIN_JSX = """
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
"""

APP_JSX = """
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
"""

INDEX_CSS = """
@tailwind base;
@tailwind components;
@tailwind utilities;
"""

AUTH_CONTEXT_JSX = """
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      setAuth(JSON.parse(user));
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
"""

CART_CONTEXT_JSX = """
import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = localStorage.getItem('cartItems');
    if (items) {
      setCartItems(JSON.parse(items));
    }
  }, []);

  const addToCart = (product, qty) => {
    const exist = cartItems.find((x) => x._id === product._id);
    let newCartItems;
    if (exist) {
      newCartItems = cartItems.map((x) =>
        x._id === product._id ? { ...x, qty } : x
      );
    } else {
      newCartItems = [...cartItems, { ...product, qty }];
    }
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  const removeFromCart = (id) => {
    const newCartItems = cartItems.filter((x) => x._id !== id);
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
"""

NAVBAR_JSX = """
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NavBar = () => {
  const { auth, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">MyShop</Link>
        <div>
          <Link to="/cart" className="mr-4">Cart</Link>
          {auth ? (
            <>
              <Link to="/orders" className="mr-4">Orders</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
"""

HOME_JSX = """
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Latest Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg p-4">
            <Link to={`/product/${product._id}`}>
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
              <h2 className="text-lg font-semibold">{product.name}</h2>
            </Link>
            <p className="text-gray-500">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
"""

PRODUCT_PAGE_JSX = """
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CartContext from '../context/CartContext';

const Product = () => {
  const [product, setProduct] = useState({});
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  return (
    <div>
      <img src={product.image} alt={product.name} className="w-full h-96 object-cover mb-4" />
      <h1 className="text-4xl font-bold">{product.name}</h1>
      <p className="text-2xl text-gray-700 my-4">${product.price}</p>
      <p>{product.description}</p>
      <button
        onClick={() => addToCart(product, 1)}
        className="bg-gray-800 text-white px-4 py-2 rounded mt-4"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default Product;
"""

CART_PAGE_JSX = """
import React, { useContext } from 'react';
import CartContext from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item._id} className="flex justify-between items-center border-b py-2">
              <span>{item.name}</span>
              <span>{item.qty} x ${item.price}</span>
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
"""

LOGIN_PAGE_JSX = """
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const submitHandler = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form onSubmit={submitHandler}>
      <h1 className="text-2xl mb-4">Sign In</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <button type="submit" className="w-full bg-gray-800 text-white p-2 rounded">
        Sign In
      </button>
    </form>
  );
};

export default Login;
"""

REGISTER_PAGE_JSX = """
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    await axios.post('/api/auth/register', { name, email, password });
  };

  return (
    <form onSubmit={submitHandler}>
      <h1 className="text-2xl mb-4">Register</h1>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-4 border rounded" />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-4 border rounded" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" />
      <button type="submit" className="w-full bg-gray-800 text-white p-2 rounded">Register</button>
    </form>
  );
};

export default Register;
"""

ORDERS_PAGE_JSX = """
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
    };
    if (auth) {
      fetchOrders();
    }
  }, [auth]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Orders</h1>
      {/* Minimal implementation */}
      <ul>
        {orders.map(order => <li key={order._id}>Order ID: {order._id} - Total: ${order.totalPrice}</li>)}
      </ul>
    </div>
  );
};

export default Orders;
"""

FRONTEND_ENV_EXAMPLE = """
VITE_API_URL=http://localhost:5000
"""

# --- Docker Files ---

DOCKER_COMPOSE_YML = """
version: '3.8'
services:
  mongo:
    image: mongo:7
    container_name: mongo
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend
    ports:
      - '5000:5000'
    depends_on:
      - mongo
    volumes:
      - ./backend:/app
      - /app/node_modules
    env_file:
      - ./backend/.env

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - '3000:3000'
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  mongo-data:
"""

BACKEND_DOCKERFILE = """
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "npm", "run", "dev" ]
"""

FRONTEND_DOCKERFILE = """
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "dev" ]
"""

# --- Root Files ---

README_MD = """
# Full-Stack E-commerce Shop (MyShop)

This project is a complete MERN stack application with Docker support.

## Features
- JWT Authentication
- Product Catalog
- Shopping Cart & Orders
- User Profiles
- Admin Functionality (basic)

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Containerization**: Docker, Docker Compose

---

## Running the Project

### 1. Local Development (without Docker)

**Prerequisites:**
- Node.js (v18+)
- npm
- MongoDB installed and running locally

**Instructions:**

1.  **Set up Environment Variables:**
    -   In the `/backend` directory, copy `.env.example` to a new file named `.env`.
    -   Update the `MONGO_URI` to point to your local MongoDB instance.
    -   Change `JWT_SECRET` to a long, random string.

2.  **Install Dependencies:**
    -   In a terminal, navigate to the `/backend` directory and run: `npm install`
    -   In another terminal, navigate to the `/frontend` directory and run: `npm install`

3.  **Run the Servers:**
    -   In the backend terminal, run: `npm run dev` (starts on http://localhost:5000)
    -   In the frontend terminal, run: `npm run dev` (starts on http://localhost:3000)

### 2. Docker Development

**Prerequisites:**
- Docker & Docker Compose

**Instructions:**

1.  **Set up Environment Variables:**
    -   In the `/backend` directory, copy `.env.example` to a new file named `.env`.
    -   The `MONGO_URI` is already set for Docker (`mongodb://mongo:27017/myshop`).
    -   Change `JWT_SECRET` to a long, random string.

2.  **Build and Run Containers:**
    -   From the project root directory, run:
        ```bash
        docker compose up --build
        ```
    -   The frontend will be available at `http://localhost:3000`.
    -   The backend API will be available at `http://localhost:5000`.
"""


# ==============================================================================
# SCRIPT LOGIC
# ==============================================================================

def write_file(path, content):
    """Writes content to a file, creating parent directories if necessary."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', newline='\\n', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"Created: {path}")

def main(project_name, install_deps, show_docker_instructions):
    """Main function to generate the project structure and files."""

    if not project_name.isidentifier():
        print(f"Error: Project name '{project_name}' is not a valid directory name.")
        return

    print(f"Scaffolding project: {project_name}")

    # Define file paths
    files_to_create = {
        # Backend
        f"{project_name}/backend/package.json": BACKEND_PACKAGE_JSON,
        f"{project_name}/backend/server.js": SERVER_JS,
        f"{project_name}/backend/config/db.js": DB_JS,
        f"{project_name}/backend/middleware/auth.js": AUTH_MIDDLEWARE_JS,
        f"{project_name}/backend/models/User.js": USER_MODEL_JS,
        f"{project_name}/backend/models/Product.js": PRODUCT_MODEL_JS,
        f"{project_name}/backend/models/Order.js": ORDER_MODEL_JS,
        f"{project_name}/backend/routes/auth.js": AUTH_ROUTES_JS,
        f"{project_name}/backend/routes/products.js": PRODUCTS_ROUTES_JS,
        f"{project_name}/backend/routes/orders.js": ORDERS_ROUTES_JS,
        f"{project_name}/backend/controllers/authController.js": AUTH_CONTROLLER_JS,
        f"{project_name}/backend/controllers/productController.js": PRODUCT_CONTROLLER_JS,
        f"{project_name}/backend/controllers/orderController.js": ORDER_CONTROLLER_JS,
        f"{project_name}/backend/utils/errorHandler.js": ERROR_HANDLER_JS,
        f"{project_name}/backend/.env.example": BACKEND_ENV_EXAMPLE,

        # Frontend
        f"{project_name}/frontend/package.json": FRONTEND_PACKAGE_JSON,
        f"{project_name}/frontend/index.html": INDEX_HTML,
        f"{project_name}/frontend/tailwind.config.js": TAILWIND_CONFIG_JS,
        f"{project_name}/frontend/postcss.config.js": POSTCSS_CONFIG_JS,
        f"{project_name}/frontend/src/main.jsx": MAIN_JSX,
        f"{project_name}/frontend/src/App.jsx": APP_JSX,
        f"{project_name}/frontend/src/index.css": INDEX_CSS,
        f"{project_name}/frontend/src/context/AuthContext.jsx": AUTH_CONTEXT_JSX,
        f"{project_name}/frontend/src/context/CartContext.jsx": CART_CONTEXT_JSX,
        f"{project_name}/frontend/src/components/NavBar.jsx": NAVBAR_JSX,
        f"{project_name}/frontend/src/pages/Home.jsx": HOME_JSX,
        f"{project_name}/frontend/src/pages/Product.jsx": PRODUCT_PAGE_JSX,
        f"{project_name}/frontend/src/pages/Cart.jsx": CART_PAGE_JSX,
        f"{project_name}/frontend/src/pages/Login.jsx": LOGIN_PAGE_JSX,
        f"{project_name}/frontend/src/pages/Register.jsx": REGISTER_PAGE_JSX,
        f"{project_name}/frontend/src/pages/Orders.jsx": ORDERS_PAGE_JSX,
        f"{project_name}/frontend/.env.example": FRONTEND_ENV_EXAMPLE,

        # Docker
        f"{project_name}/docker/docker-compose.yml": DOCKER_COMPOSE_YML,
        f"{project_name}/backend/Dockerfile": BACKEND_DOCKERFILE,
        f"{project_name}/frontend/Dockerfile": FRONTEND_DOCKERFILE,

        # Root
        f"{project_name}/README.md": README_MD,
    }

    # Create all files
    for path, content in files_to_create.items():
        write_file(path, content)

    # Optional: Install dependencies
    if install_deps:
        print("\\nAttempting to install dependencies...")
        try:
            print("\\n--- Installing backend dependencies ---")
            subprocess.run(["npm", "ci"], cwd=f"./{project_name}/backend", check=True, shell=True)
            print("\\n--- Installing frontend dependencies ---")
            subprocess.run(["npm", "ci"], cwd=f"./{project_name}/frontend", check=True, shell=True)
            print("\\nDependencies installed successfully.")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("\\nCould not install dependencies. Please run 'npm install' in both /backend and /frontend directories manually.")

    # Print next steps
    print("\\n========================================")
    print("Project scaffolding complete!")
    print("========================================")
    print("\\nNext Steps:")
    print(f"1. Navigate into the project: cd {project_name}")
    print("2. Set up your environment variables:")
    print("   - In `/backend`, copy `.env.example` to `.env`")
    print("   - Edit `.env` and set your `MONGO_URI` and a secure `JWT_SECRET`.")

    if show_docker_instructions:
        print("\\n--- To run with Docker ---")
        print("3. Build and start the containers:")
        print("   docker compose up --build")
    else:
        print("\\n--- To run locally ---")
        print("3. Install dependencies (if you skipped it):")
        print("   - In one terminal: cd backend && npm install")
        print("   - In another terminal: cd frontend && npm install")
        print("4. Start the servers:")
        print("   - In the backend terminal: npm run dev")
        print("   - In the frontend terminal: npm run dev")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold a full-stack e-commerce application.")
    parser.add_argument(
        "--project",
        type=str,
        default="myshop",
        help="The name of the project directory to create."
    )
    parser.add_argument(
        "--install",
        action="store_true",
        help="If set, attempt to run 'npm ci' in frontend and backend directories."
    )
    parser.add_argument(
        "--docker",
        action="store_true",
        help="If set, show Docker instructions at the end."
    )
    args = parser.parse_args()
    main(args.project, args.install, args.docker)
