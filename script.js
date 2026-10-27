// Product data
const productsData = [
    {
        id: 1,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 2499,
        oldPrice: 2999,
        emoji: "🎧",
        tint: "#eeebff"
    },
    {
        id: 2,
        name: "Everyday Backpack",
        category: "Fashion",
        price: 1499,
        oldPrice: 1799,
        emoji: "🎒",
        tint: "#e5f3ed"
    },
    {
        id: 3,
        name: "Smart Watch",
        category: "Electronics",
        price: 3299,
        oldPrice: 3999,
        emoji: "⌚",
        tint: "#e7efff"
    },
    {
        id: 4,
        name: "Classic Sneakers",
        category: "Fashion",
        price: 2199,
        oldPrice: 2599,
        emoji: "👟",
        tint: "#fff0e4"
    },
    {
        id: 5,
        name: "Ceramic Coffee Mug",
        category: "Home",
        price: 349,
        oldPrice: 449,
        emoji: "☕",
        tint: "#fff0ed"
    },
    {
        id: 6,
        name: "Sunglasses",
        category: "Accessories",
        price: 799,
        oldPrice: 999,
        emoji: "🕶️",
        tint: "#fff5d9"
    },
    {
        id: 7,
        name: "Desk Lamp",
        category: "Home",
        price: 1199,
        oldPrice: 1499,
        emoji: "💡",
        tint: "#eaf4ff"
    },
    {
        id: 8,
        name: "Travel Bottle",
        category: "Accessories",
        price: 599,
        oldPrice: 749,
        emoji: "🧴",
        tint: "#e5f7f6"
    }
];

const money = n =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(n);

// Cart state
let cart = {};
let couponApplied = false;


function renderProducts() {
    const search = document
        .getElementById("search")
        .value.trim().toLowerCase();

    const cat = document.getElementById("category").value;
    const sort = document.getElementById("sort").value;

    let list = productsData.filter(p =>
        (cat === "all" || p.category === cat) &&
        p.name.toLowerCase().includes(search)
    );

    if (sort === "low") {
        list.sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
        list.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
        list.sort((a, b) => a.name.localeCompare(b.name));
    }

    document.getElementById("resultCount").textContent =
        `${list.length} product${list.length === 1 ? "" : "s"}`;

    document.getElementById("products").innerHTML = list.length
        ? list.map(p => `
            <article class="product">
                <div class="product-art" style="--tint:${p.tint}">
                    ${p.emoji}
                </div>

                <div class="product-info">
                    <span class="category">${p.category}</span>
                    <h3>${p.name}</h3>

                    <div class="price-row">
                        <div>
                            <span class="price">${money(p.price)}</span>
                            <span class="old-price">${money(p.oldPrice)}</span>
                        </div>
                    </div>

                    <button class="add-btn"
                        onclick="addToCart(${p.id})">
                        ＋ Add to cart
                    </button>
                </div>
            </article>
        `).join("")
        : `<div class="empty" style="grid-column:1/-1">
            No products match your search.
           </div>`;
}




function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    toast("Added to cart");
}

function changeQty(id, delta) {
    if (!cart[id]) return;

    cart[id] += delta;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    renderCart();
}

function removeItem(id) {
    delete cart[id];
    renderCart();
    toast("Item removed");
}




function getSubtotal() {
    return Object.entries(cart).reduce(
        (sum, [id, qty]) =>
            sum + productsData.find(
                p => p.id === Number(id)
            ).price * qty,
        0
    );
}

function getDiscount() {
    return couponApplied ? getSubtotal() * 0.10 : 0;
}

function getDelivery() {
    return getSubtotal() === 0 || getSubtotal() >= 2000
        ? 0
        : 99;
}

function renderCart() {
    const entries = Object.entries(cart);

    const count = entries.reduce(
        (n, [, q]) => n + q,
        0
    );

    document.getElementById("cartCount").textContent = count;

    document.getElementById("cartLabel").textContent =
        `${count} item${count === 1 ? "" : "s"}`;

    document.getElementById("cartItems").innerHTML =
        entries.length
            ? entries.map(([id, qty]) => {
                const p = productsData.find(
                    x => x.id === Number(id)
                );

                return `
                    <div class="cart-item">
                        <div class="mini-art"
                            style="background:${p.tint}">
                            ${p.emoji}
                        </div>

                        <div>
                            <div class="item-title">${p.name}</div>

                            <div class="item-price">
                                ${money(p.price)} each ·
                                <b>${money(p.price * qty)}</b>
                            </div>

                            <div class="item-bottom">
                                <div class="qty">
                                    <button
                                        aria-label="Decrease ${p.name}"
                                        onclick="changeQty(${p.id}, -1)">
                                        −
                                    </button>

                                    <span>${qty}</span>

                                    <button
                                        aria-label="Increase ${p.name}"
                                        onclick="changeQty(${p.id}, 1)">
                                        +
                                    </button>
                                </div>

                                <button class="remove"
                                    onclick="removeItem(${p.id})">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("")
            : `<div class="empty">
                Your cart is waiting for something nice.<br>
                Add a product to get started ✨
               </div>`;

    
    if (couponApplied && getSubtotal() === 0) {
        couponApplied = false;

        document.getElementById("couponNote").textContent =
            "Try WELCOME10 for 10% off.";
    }

   
    document.getElementById("subtotal").textContent =
        money(getSubtotal());

    document.getElementById("discount").textContent =
        "−" + money(getDiscount());

    document.getElementById("delivery").textContent =
        money(getDelivery());

    document.getElementById("total").textContent =
        money(
            Math.max(
                0,
                getSubtotal() - getDiscount() + getDelivery()
            )
        );
}




function applyCoupon() {
    const code = document
        .getElementById("couponCode")
        .value.trim().toUpperCase();

    const note = document.getElementById("couponNote");

    if (code === "WELCOME10" && getSubtotal() > 0) {
        couponApplied = true;

        note.style.color = "var(--green)";
        note.textContent = "Coupon applied! You saved 10%.";

        renderCart();
        toast("Coupon applied successfully");
    } else {
        couponApplied = false;
        note.style.color = "var(--red)";

        note.textContent = getSubtotal() === 0
            ? "Add an item before applying a coupon."
            : "Invalid coupon. Try WELCOME10.";

        renderCart();
    }
}




function openCheckout() {
    if (getSubtotal() === 0) {
        toast("Add at least one product before checkout");
        return;
    }

    document.getElementById("checkoutModal").style.display = "flex";
}

function closeCheckout() {
    document.getElementById("checkoutModal").style.display = "none";
}

document.getElementById("checkoutForm").addEventListener(
    "submit",
    function (e) {
        e.preventDefault();

        const name = document
            .getElementById("customerName")
            .value.trim();

        if (!name) return;

       
        const orderId =
            "SE" + Math.floor(100000 + Math.random() * 900000);

        closeCheckout();

        
        cart = {};
        couponApplied = false;

        document.getElementById("couponCode").value = "";

        document.getElementById("couponNote").style.color =
            "var(--muted)";

        document.getElementById("couponNote").innerHTML =
            'Try <b>WELCOME10</b> for 10% off.';

        renderCart();

        // Display order confirmation
        document.getElementById("notice").style.display = "block";

        document.getElementById("notice").innerHTML =
            `✓ Thanks, ${name}! Demo order <b>${orderId}</b> placed successfully.`;

        toast("Demo order placed");

        document.getElementById("cart").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);



document.getElementById("search").addEventListener(
    "input",
    renderProducts
);

document.getElementById("category").addEventListener(
    "change",
    renderProducts
);

document.getElementById("sort").addEventListener(
    "change",
    renderProducts
);



document.getElementById("checkoutModal").addEventListener(
    "click",
    e => {
        if (e.target.id === "checkoutModal") {
            closeCheckout();
        }
    }
);


function toast(msg) {
    const el = document.getElementById("toast");

    el.textContent = msg;
    el.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(
        () => el.style.display = "none",
        2200
    );
}




renderProducts();
renderCart();