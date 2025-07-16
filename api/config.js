module.exports = {
    dev: {
        ROOT_DIR: __dirname,
        DB_URL: process.env.DB_URL || 'mongodb://localhost/clicksporttest',
        UPLOAD_DIR: __dirname + '/public/uploads',
        secret: 'ujCxuqowQa23pBc9283',
        STATIC_DIR: __dirname + '/public',
        Models: {
            ShoppingList: {
                model: 'ShoppingList',
                name: 'Список покупок'
            }
        }
    },
    prod: {
        ROOT_DIR: __dirname,
        DB_URL: process.env.DB_URL || 'mongodb://localhost/clicksporttest',
        UPLOAD_DIR: __dirname + '/public/uploads',
        secret: 'p0BcewZx2019siDro8552Mvplfa',
        STATIC_DIR: __dirname + '/public',
        Models: {
            ShoppingList: {
                model: 'ShoppingList',
                name: 'Список покупок'
            }
        }
    }
}
