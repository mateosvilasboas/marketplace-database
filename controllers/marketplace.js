const categoryQueries = require('../queries/categories')
const productQueries = require('../queries/products')
const storesQueries = require('../queries/stores')
const models = require('../models/models')

const populate = async (req, res) => {
    try {
        await models.Category.drop()
        await models.Store.drop()
        await models.Product.drop()
        await models.syncDB()
        await categoryQueries.createCategories()
        await storesQueries.createStores()
        await productQueries.createProducts()
        
        return res.status(201).json({
            message: "Categories, Stores and Product created.",
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error",
            error: e.message
        })
    }
}

const getCategories = async (req, res) => {
    try {
        const { id } = req.params
        const store = await models.Store.findOne({where: {id: id}, include: [models.Product, models.Category]})
        if (!store) {
            return res.status(404).json({
                message: "Error",
                error: "Store not found"
            })
        }
        
        const products = await models.Product.findAll({where: {StoreId: id}, include: [models.Category]})
        const marketplaceCategories = await models.Category.findAll()
        const categoriesWithProductsSet = new Set()
        const categoriesWithProductsList = []

        if (products.length > 0) {
            products.forEach(product => {
                if(product.Categories.length > 0){
                    categoriesWithProductsSet.add(...product.Categories)
                } 
            })
        }
        if (categoriesWithProductsSet.size > 0) {
            categoriesWithProductsSet.forEach(category => {
                categoriesWithProductsList.push(category)
            })
        }

        const categoriesWithProductsMapped = categoriesWithProductsList.map(category => {
            return {
                id: category.id,
                name: category.name,
                description: category.description,
                icon: category.icon,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        })
        const storeCategoriesMapped = store.Categories.map(category => {
            return {
                id: category.id,
                name: category.name,
                description: category.description,
                icon: category.icon,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        })

        return res.status(200).json({
            categoriesWithProducts: categoriesWithProductsMapped,
            storeCategories: storeCategoriesMapped,
            marketplaceCategories: marketplaceCategories,
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error",
            error: e.message
        })
    }
}

module.exports = {
    populate,
    getCategories
}