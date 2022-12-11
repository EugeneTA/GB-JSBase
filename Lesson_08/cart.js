"use strict";

//#region HTML Templates

// HTML Template for cart 
const cartTemplate = `
<div class="cart">
<div class="cartRow cartHeader">
<div>Product</div>
<div>Qty</div>
<div>Price</div>
<div>Total</div>
</div>
(cartItemsHtml)
<div class="cartTotal">
<div></div>
<div></div>
<div class="cartTotalText">Total:</div>
<div>$(cartTotalHtml)</div>
</div>
</div>`;

// HTML Template for cart item
const cartItemHtmlTemplate = `
<div class="cartRow">
<div>(name)</div>
<div>(count)</div>
<div>$(price)</div>
<div>$(total)</div>
</div>
`;

//#endregion

//#region Classes

// Class to describe product
class Product {
    constructor(name, price, imageUrl) {
      this.name = name;
      this.price = typeof(price) === 'string' ? parseFloat(price.match(/[0-9]{1,}[.,][0-9]{0,2}/)) : price;
      this.imageUrl = imageUrl;
    }
}

// Pseudo database class to store products. 
class Database {
    #database = {};

    addProduct(product) {
        if (product && (product instanceof Product)){
            this.#database[product.name] === undefined ? this.#database[product.name] = product : console.log('Product already exist in database');
            return product.name;
        }
        
        return undefined;
    }

    getProduct(id) {
        return this.#database[id];
    }
}

// Cart item class
// Store product item  and count.
class CartItem {
    constructor(product, count) {
        this.product = product;
        this.count = count;
    }

    /**
     * Метод получения суммарной стоимости продукта в корзине.
     * @return {number} - суммарная стоимость продукта.
     */
    getTotal() {
        if (!this.product) return 0;
        return this.product.price * parseInt(this.count);
    }

    /**
     * Метод получения всех продуктов из корзины в виде словаря.
     * @param {string} template - html шаблон показа продукта в корзине.
     * @return {string} - переданный шаблон, заполенный данными о продукте. 
     */
    getHtmlCode(template){

        if (!this.product) return "";

        return template
            .replace('(name)', this.product.name)
            .replace('(count)', this.count )
            .replace('(price)', this.product.price.toFixed(2))
            .replace('(total)', this.getTotal().toFixed(2));
    }
}

// Cart class
// 
class Cart {

    // Cart items {productId: count}
    #cartItems = {};
    // Total items in cart
    #totalItemsCount = 0;
    // Cart hide time id to cancel timeout
    #cartHideTimeoutId = -1;
    // Cart auto hide timeout in ms
    cartHideTimeout = 3000;

    constructor(cartTemplate, itemTemplate) {
        this.cartTemplate = cartTemplate;
        this.cartItemTemplate =  itemTemplate;
    }

    /**
     * Метод добавляет продукт в корзину.
     * @param {number} id - Id продукта в базе данных.
     */
    addToCart(id){
        if (id && productDB.getProduct(id)){
            console.log(`Added to cart: ${productDB.getProduct(id).name}`);
            this.#totalItemsCount += 1;
            this.#cartItems[id] === undefined ? this.#cartItems[id] = 1 : this.#cartItems[id] += 1;
            document.querySelector('.cart') ? this.showCart() : "" ;
        }
        else
        {
            console.log('Error add product to the cart');
        }
    }

    /**
     * Метод удаляет продукт в корзину.
     * @param {number} id - Id продукта в базе данных.
     */
    removeFromCart(id) {
        if (id && productDB.getProduct(id) && this.#cartItems[id]){
            console.log(`Remove from cart: ${productDB.getProduct(id).name}`);
            this.#totalItemsCount -= this.#cartItems[id];
            delete this.#cartItems[id];
            document.querySelector('.cart') ? this.showCart() : "" ;
        }
        else
        {
            console.log('Error add product to the cart');
        }
    }

    /**
     * Метод получения всех продуктов из корзины в виде словаря.
     * @return {CartItems} - словарь продуктов в корзине. Ключ - Id в базе данных
     */
    getCart(){
        return this.#cartItems;
    }

    /**
     * Метод получения всех продуктов из корзины в виде массива CartItem.
     * @return {CartItem[]} - массив состоящий из элеиентов CartItem.
     */
    getCartItemsAsArray() {
        const result = [];

        for (const key in this.#cartItems) {
            result.push(new CartItem(productDB.getProduct(key), this.#cartItems[key]));
        }

        return result;
    }

    /**
     * Метод получения всех продуктов из корзины в виде словаря.
     * @return {number} - общее количество продуктов в корзине.
     */
    getCartItemsCount(){
        return this.#totalItemsCount;
    }


    /**
     * Метод показа корзины на странице в соответствии с переданным шаблоном
     */
    showCart() {
        this.hideCart();
        // получаем список продуктов в корзине в виде массива
        const cartItems = userCart.getCartItemsAsArray();

        // на основе списка продуктов создаем html по заданному шаблону для отображения продукта в корзине 
        const cartItemsHtml = cartItems.map(pr => pr.getHtmlCode(this.cartItemTemplate)).join("");
        
        // считаем общую стоимость корзины
        const cartTotal = cartItems.reduce((total, item) => total + item.getTotal(), 0.0);
        
        // обновляем в шаблон корзины
        const cartHtml = this.cartTemplate?.replace('(cartItemsHtml)', cartItemsHtml).replace('(cartTotalHtml)', cartTotal.toFixed(2));
        
        // добаляем обновленную корзину в html страницу магазина
        document.querySelector('.rightHeader').insertAdjacentHTML('beforeEnd',cartHtml);
        
        // устанавливаем таймают на автоматическое скрывание корзины. 
        this.#cartHideTimeoutId = setTimeout(() => this.hideCart(), this.cartHideTimeout);
    }
    
    /**
     * Метод скрывает показ корзины на странице
     */
    hideCart() {
        if (0 < this.#cartHideTimeoutId) {
            clearTimeout(this.#cartHideTimeoutId);
            this.#cartHideTimeoutId = -1;
        }
        document.querySelector('.cart')?.remove();
    }

    /**
     * Метод обновления шаблона отображения корзины продуктов.
     * @param {string} template - шаблон.
     */
    updateCartTemplate(template) {
        this.cartTemplate = template;
    }

    /**
     * Метод обновления шаблона отображения продукта в корзине.
     * @param {string} template - шаблон.
     */
    updateCartItemTemplate(template) {
        this.cartItemTemplate = template;
    }
}

//#endregion


let productDB = new Database();
let userCart = new Cart(cartTemplate, cartItemHtmlTemplate);
userCart.cartHideTimeout = 3000;

const itemsContainer = document.querySelector('.featuredItems');
const itemEls = itemsContainer.querySelectorAll('.featuredItem');
const cartItemCountEl = document.querySelector('.cartIconWrap').querySelector('span');

Array.from(itemEls).forEach(pr => {
    const prName = pr.querySelector('.featuredName').innerText;
    const prPrice = pr.querySelector('.featuredPrice').innerText;
    const prImgUrl = pr.querySelector('img').src;
    const prod = new Product(prName, parseFloat(prPrice.match(/[0-9]{1,}[.,][0-9]{0,2}/)), prImgUrl);
    const prodID = productDB.addProduct(prod);
    pr.querySelector('button').addEventListener('click', () => {
        userCart.addToCart(prodID);
        if (cartItemCountEl) cartItemCountEl.innerText = userCart.getCartItemsCount();
    });
});

document.querySelector('.cartIconWrap').addEventListener('click', function () {    
    document.querySelector('.cart') ? userCart.hideCart() : userCart.showCart();
});

