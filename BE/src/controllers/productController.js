const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active',
      visibility = 'public',
      isFeatured,
      isNew,
      tags
    } = req.query;

    // Build query
    const query = {
      status: status,
      visibility: visibility
    };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Brand filter
    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    // New products filter
    if (isNew !== undefined) {
      if (isNew === 'true') {
        query.isNew = true;
        query.newUntil = { $gte: new Date() };
      } else {
        query.$or = [
          { isNew: false },
          { newUntil: { $lt: new Date() } }
        ];
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sort = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    }
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);

    // Calculate price range for current results
    const priceRange = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        priceRange: priceRange.length > 0 ? priceRange[0] : { minPrice: 0, maxPrice: 0 },
        filters: {
          category,
          subcategory,
          brand,
          minPrice,
          maxPrice,
          search,
          isFeatured,
          isNew,
          tags
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      status: 'active',
      visibility: 'public'
    })
      .populate('category', 'name slug')
      .sort({ 'sales.totalSold': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get best selling products
// @route   GET /api/products/bestselling
// @access  Public
const getBestSellingProducts = async (req, res) => {
  try {
    const { limit = 8, period = '30' } = req.query;
    
    // Calculate date range for best selling period
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    const products = await Product.find({
      status: 'active',
      visibility: 'public',
      'sales.totalSold': { $gt: 0 }
    })
      .populate('category', 'name slug')
      .sort({ 'sales.totalSold': -1, 'ratings.average': -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get new products
// @route   GET /api/products/new
// @access  Public
const getNewProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isNew: true,
      newUntil: { $gte: new Date() },
      status: 'active',
      visibility: 'public'
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search products by name
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10, category } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      $text: { $search: q },
      status: 'active',
      visibility: 'public'
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query, {
      score: { $meta: 'textScore' }
    })
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' }, 'sales.totalSold': -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: products,
      searchTerm: q
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { slug: req.params.id }
      ]
    })
      .populate('category', 'name slug description')
      .populate('subcategory', 'name slug description')
      .populate('relatedProducts', 'name slug price images')
      .populate('crossSellProducts', 'name slug price images')
      .populate('upSellProducts', 'name slug price images');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has permission to view non-public products
    if (product.visibility !== 'public' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // Add createdBy field
    req.body.createdBy = req.user.id;

    // Validate category exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Validate subcategory exists and belongs to category
    if (req.body.subcategory) {
      const subcategory = await Category.findById(req.body.subcategory);
      if (!subcategory || subcategory.parentCategory.toString() !== req.body.category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subcategory'
        });
      }
    }

    // Ensure at least one image is marked as primary
    if (req.body.images && req.body.images.length > 0) {
      const hasPrimary = req.body.images.some(img => img.isPrimary);
      if (!hasPrimary) {
        req.body.images[0].isPrimary = true;
      }
    }

    const product = await Product.create(req.body);

    // Populate the created product
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add updatedBy field
    req.body.updatedBy = req.user.id;

    // Validate category if being updated
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Validate subcategory if being updated
    if (req.body.subcategory) {
      const subcategory = await Category.findById(req.body.subcategory);
      const categoryId = req.body.category || product.category;
      if (!subcategory || subcategory.parentCategory.toString() !== categoryId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subcategory'
        });
      }
    }

    // Handle images update
    if (req.body.images && req.body.images.length > 0) {
      const hasPrimary = req.body.images.some(img => img.isPrimary);
      if (!hasPrimary) {
        req.body.images[0].isPrimary = true;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by changing status to archived
    product.status = 'archived';
    product.visibility = 'hidden';
    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product archived successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product inventory (Admin/Warehouse only)
// @route   PUT /api/products/:id/inventory
// @access  Private/Admin/Warehouse
const updateProductInventory = async (req, res) => {
  try {
    const { quantity, reserved, minQuantity, trackQuantity, allowBackorder } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update inventory fields
    const inventoryUpdate = {};
    if (quantity !== undefined) inventoryUpdate['inventory.quantity'] = quantity;
    if (reserved !== undefined) inventoryUpdate['inventory.reserved'] = reserved;
    if (minQuantity !== undefined) inventoryUpdate['inventory.minQuantity'] = minQuantity;
    if (trackQuantity !== undefined) inventoryUpdate['inventory.trackQuantity'] = trackQuantity;
    if (allowBackorder !== undefined) inventoryUpdate['inventory.allowBackorder'] = allowBackorder;

    inventoryUpdate.updatedBy = req.user.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: inventoryUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product inventory updated successfully',
      data: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        inventory: updatedProduct.inventory,
        availableQuantity: updatedProduct.availableQuantity,
        stockStatus: updatedProduct.stockStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories', 'name slug description image')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getBestSellingProducts,
  getNewProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductInventory,
  getProductCategories
};
