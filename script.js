// ==========================================
// METEUR ONLINE SHOPPING - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------
    // CART
    // ------------------------------------------

    let cart = JSON.parse(localStorage.getItem("meteurCart")) || [];

    function updateCartCount() {
        const cartCount = document.getElementById("cartCount");

        if (cartCount) {
            const totalItems = cart.reduce(function (total, item) {
                return total + item.quantity;
            }, 0);

            cartCount.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem("meteurCart", JSON.stringify(cart));
        updateCartCount();
    }

    function addToCart(productName, price) {

        const existingProduct = cart.find(function (item) {
            return item.name === productName;
        });

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({
                name: productName,
                price: Number(price),
                quantity: 1
            });
        }

        saveCart();

        alert(productName + " has been added to your cart.");
    }

    // ------------------------------------------
    // ADD TO CART BUTTONS
    // ------------------------------------------

    const addButtons = document.querySelectorAll(".add-cart");

    addButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const productName = button.getAttribute("data-product");
            const productPrice = button.getAttribute("data-price");

            if (productName && productPrice) {
                addToCart(productName, productPrice);
            }

        });

    });

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const searchTerm = searchInput.value.trim();

            if (searchTerm === "") {
                alert("Please enter a product to search.");
                return;
            }

            window.location.href =
                "shop.html?search=" + encodeURIComponent(searchTerm);

        });

    }

    // ------------------------------------------
    // NEWSLETTER
    // ------------------------------------------

    const newsletterForm = document.getElementById("newsletterForm");

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const emailInput =
                newsletterForm.querySelector('input[type="email"]');

            if (!emailInput || emailInput.value.trim() === "") {
                alert("Please enter your email address.");
                return;
            }

            alert(
                "Thank you for subscribing to Meteur Online Shopping!"
            );

            emailInput.value = "";

        });

    }

    // ------------------------------------------
    // SMOOTH SCROLLING
    // ------------------------------------------

    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = link.getAttribute("href");

            if (targetId && targetId !== "#") {

                const target = document.querySelector(targetId);

                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }

        });

    });

    // ------------------------------------------
    // INITIAL CART COUNT
    // ------------------------------------------

    updateCartCount();

});
