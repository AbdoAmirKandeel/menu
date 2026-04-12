// 1. MAKE FUNCTIONS GLOBAL IMMEDIATELY
window.toggleCart = function() {
    document.getElementById('cart-sidebar').classList.toggle('active');
};

window.handleSearch = function() {
    searchQuery = document.getElementById('menu-search').value.toLowerCase();
    applyFilters();
};

window.filterMenu = function(category, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    currentCategory = category;
    applyFilters();
};

window.addToCart = function(id) {
    const item = fullMenu.find(i => i.id === id);
    if (item) {
        cart.push(item);
        updateCartUI();
        if (cart.length === 1) window.toggleCart();
    }
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

window.sendToWhatsApp = function() {
    const name = document.getElementById('cust-name').value;
    const addr = document.getElementById('cust-address').value;
    if (!name || !addr || cart.length === 0) {
        alert("Please fill in your details and add items to cart!");
        return;
    }
    let message = `*NEW ORDER*%0A*Name:* ${name}%0A*Address:* ${addr}%0A%0A*Items:*%0A`;
    cart.forEach((item, i) => message += `${i+1}. ${item.name} - ${item.price.toFixed(3)} KWD%0A`);
    message += `%0A*Total:* ${document.getElementById('grand-total').innerText}`;
    window.open(`https://wa.me/+96598708234?text=${message}`, '_blank');
};

// 2. FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyC2TrBtOQyQ70Hq8ZDw-EVQ7Mac7IJc0Rw",
    authDomain: "instaclone1-e8693.firebaseapp.com",
    databaseURL: "https://instaclone1-e8693-default-rtdb.firebaseio.com/",
    projectId: "instaclone1-e8693",
    appId: "1:737357735836:web:b62f7f7e5ac03a8f944a59"
};

firebase.initializeApp(firebaseConfig);
const rtdb = firebase.database();

let cart = [];
let fullMenu = [];
let currentCategory = 'all';
let searchQuery = '';

// 3. CORE LOGIC
function fetchMenu() {
    rtdb.ref('menu').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        fullMenu = Object.keys(data).map(id => ({ id, ...data[id] }));
        applyFilters();
    });
}

function applyFilters() {
    const filtered = fullMenu.filter(item => {
        const matchesCat = (currentCategory === 'all' || item.category === currentCategory);
        const matchesSearch = item.name.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
    });
    displayMenu(filtered);
}

window.displayMenu = function(items) {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = items.map(item => `
        <div class="menu-card">
            <div class="menu-img-container">
                <img src="${item.image || 'https://via.placeholder.com/400x300?text=Bistro+KW'}" 
                     class="menu-img" 
                     alt="${item.name}">
            </div>

            <div class="card-info" style="padding: 1.2rem; flex-grow: 1; display: flex; flex-direction: column;">
                <h3 style="margin: 0 0 8px 0; font-size: 1.15rem; color: #fff;">${item.name}</h3>
                <p style="color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; line-height: 1.4; flex-grow: 1;">
                    ${item.description || 'Authentic flavors, prepared fresh daily.'}
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #2a2a2a; pt: 1rem;">
                    <span class="price" style="color: #d4af37; font-weight: 700; font-size: 1.1rem;">
                        ${parseFloat(item.price).toFixed(3)} <small style="font-size: 0.6rem;">KWD</small>
                    </span>
                    <button class="add-btn" onclick="addToCart('${item.id}')" 
                            style="background: #d4af37; color: #000; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Add +
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};
window.updateCartUI = function() {
    const list = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    if(badge) badge.innerText = cart.length;

    let subtotal = 0;

    if (cart.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; margin-top:50px; color:#555;">
                <i class="fas fa-shopping-basket" style="font-size:3rem; margin-bottom:15px;"></i>
                <p>Your basket is empty</p>
            </div>`;
    } else {
        list.innerHTML = cart.map((item, i) => {
            subtotal += parseFloat(item.price);
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4 style="margin:0;">${item.name}</h4>
                        <span style="font-size:0.9rem;">${parseFloat(item.price).toFixed(3)} KWD</span>
                    </div>
                    <button onclick="removeFromCart(${i})" 
                            style="background:none; border:none; color:#ff4d4d; padding:10px; cursor:pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    const delivery = subtotal > 0 ? 1.000 : 0;
    const total = subtotal + delivery;

    document.getElementById('subtotal').innerText = subtotal.toFixed(3) + " KWD";
    document.getElementById('delivery-fee').innerText = delivery.toFixed(3) + " KWD";
    document.getElementById('grand-total').innerText = total.toFixed(3) + " KWD";
};

// START
fetchMenu();