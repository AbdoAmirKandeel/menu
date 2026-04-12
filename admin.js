/* ============================================================
   BISTRO ADMIN LOGIC - Restaurant Edition
   ============================================================ */

// 1. FIREBASE CONFIG (Matching your website)
const firebaseConfig = {
    apiKey: "AIzaSyC2TrBtOQyQ70Hq8ZDw-EVQ7Mac7IJc0Rw",
    authDomain: "instaclone1-e8693.firebaseapp.com",
    databaseURL: "https://instaclone1-e8693-default-rtdb.firebaseio.com/",
    projectId: "instaclone1-e8693",
    appId: "1:737357735836:web:b62f7f7e5ac03a8f944a59"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const rtdb = firebase.database();

// 2. REFERENCES
const foodForm = document.getElementById('add-food-form');
const adminGrid = document.getElementById('admin-menu-grid');

// 3. UPLOAD DISH (The "Add" Logic)
foodForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Mapping values to match your website's expected structure
    const newDish = {
        name: document.getElementById('food-name').value,
        price: parseFloat(document.getElementById('food-price').value), // Numbers for math
        category: document.getElementById('food-category').value,
        image: document.getElementById('food-image').value,
        description: document.getElementById('food-desc').value
    };

    // We use 'menu' (lowercase) to match your fetchMenu() function
    rtdb.ref('menu').push(newDish)
        .then(() => {
            alert("✨ Dish added to your restaurant menu!");
            foodForm.reset();
        })
        .catch((error) => {
            console.error("Upload Error:", error);
            alert("Upload Failed: " + error.message);
        });
});

// 4. LIVE INVENTORY (The "View & Delete" Logic)
rtdb.ref('menu').on('value', (snapshot) => {
    adminGrid.innerHTML = ""; // Clear loader

    const data = snapshot.val();
    
    if (data) {
        Object.keys(data).forEach(id => {
            const item = data[id];
            const cardHTML = `
                <div class="admin-card">
                    <div class="admin-info">
                        <img src="${item.image || 'https://via.placeholder.com/60x60'}" class="admin-img-preview">
                        <div class="admin-details">
                            <h3>${item.name}</h3>
                            <span>${parseFloat(item.price).toFixed(3)} KWD <small>(${item.category})</small></span>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="deleteDish('${id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            adminGrid.insertAdjacentHTML('afterbegin', cardHTML);
        });
    } else {
        adminGrid.innerHTML = `<p style="text-align:center; color:gray; padding:20px;">No items found in your restaurant menu.</p>`;
    }
});

// 5. GLOBAL DELETE FUNCTION
window.deleteDish = function(id) {
    if (confirm("Are you sure you want to remove this dish from the menu?")) {
        rtdb.ref('menu').child(id).remove()
            .then(() => {
                console.log("Item deleted successfully");
            })
            .catch((error) => {
                alert("Delete failed: " + error.message);
            });
    }
};