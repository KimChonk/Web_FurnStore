const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const query = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await Category.find(query)
      .populate('subcategories', 'name slug description image isActive')
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

// @desc    Get category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ]
    }).populate('subcategories', 'name slug description image isActive');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    // If parentCategory is specified, validate it exists
    if (req.body.parentCategory) {
      const parentCategory = await Category.findById(req.body.parentCategory);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category'
        });
      }
    }

    const category = await Category.create(req.body);

    // If this is a subcategory, add it to parent's subcategories array
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $push: { subcategories: category._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // If changing parent category, update relationships
    if (req.body.parentCategory !== undefined && 
        req.body.parentCategory !== category.parentCategory?.toString()) {
      
      // Remove from old parent if exists
      if (category.parentCategory) {
        await Category.findByIdAndUpdate(
          category.parentCategory,
          { $pull: { subcategories: category._id } }
        );
      }

      // Add to new parent if specified
      if (req.body.parentCategory) {
        const newParent = await Category.findById(req.body.parentCategory);
        if (!newParent) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parent category'
          });
        }
        await Category.findByIdAndUpdate(
          req.body.parentCategory,
          { $push: { subcategories: category._id } }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subcategories', 'name slug description image');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({
      $or: [
        { category: req.params.id },
        { subcategory: req.params.id }
      ]
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} associated products`
      });
    }

    // Remove from parent's subcategories if it's a subcategory
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subcategories: category._id } }
      );
    }

    // Delete all subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      await Category.deleteMany({ _id: { $in: category.subcategories } });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get category hierarchy
// @route   GET /api/categories/hierarchy
// @access  Public
const getCategoryHierarchy = async (req, res) => {
  try {
    const mainCategories = await Category.find({
      parentCategory: null,
      isActive: true
    })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        select: 'name slug description image sortOrder'
      })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: mainCategories
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
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy
};
