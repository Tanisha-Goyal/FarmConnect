// Mock data
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'farmer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password', role: 'buyer' }
];

let products = [
    { id: 1, name: 'Fresh Tomatoes', farmer: 'John Doe', price: 2.99, unit: 'kg', image: 'https://placehold.co/200x200?text=Tomatoes', quantity: 100, rating: 4.5 },
    { id: 2, name: 'Organic Apples', farmer: 'Jane Smith', price: 3.99, unit: 'kg', image: 'https://placehold.co/200x200?text=Apples', quantity: 75, rating: 4.8 },
    { id: 3, name: 'Free-range Eggs', farmer: 'Bob Johnson', price: 4.50, unit: 'dozen', image: 'https://placehold.co/200x200?text=Eggs', quantity: 50, rating: 4.2 },
];

let orders = [];
let cart = [];
let currentUser = null;

// DOM Elements
const mainNav = document.getElementById('mainNav');
const mainContent = document.getElementById('mainContent');
const homeBtn = document.getElementById('homeBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const farmerDashboard = document.getElementById('farmerDashboard');
const buyerDashboard = document.getElementById('buyerDashboard');
const farmerContent = document.getElementById('farmerContent');
const buyerContent = document.getElementById('buyerContent');
const chatSection = document.getElementById('chat');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const addProductForm = document.getElementById('addProductForm');
const searchForm = document.getElementById('searchForm');
const searchResults = document.getElementById('searchResults');

//API
const UNSPLASH_ACCESS_KEY = 'V_q15vNv763aTi5Ph37K4l9-vjz9ciQQ6-dxA2SesUc'; // Replace with your actual Unsplash Access Key
const IMAGE_COUNT = 5; // Number of images to fetch
const CAROUSEL_INTERVAL = 3000; // Time in milliseconds to change images
let currentImageIndex = 0;

// Search for photos based on a query
async function searchImages(query) {
    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?client_id=${UNSPLASH_ACCESS_KEY}&query=${query}&per_page=${IMAGE_COUNT}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        return data.results.map(photo => photo.urls.regular);
    } catch (error) {
        console.error('Error searching images:', error);
        return [];
    }
}

// Display images in the carousel
function displayImages(imageUrls) {
    const carouselInner = document.getElementById('carouselInner');
    if (!carouselInner) {
        console.error('Carousel element not found!');
        return;
    }

    if (imageUrls.length === 0) {
        carouselInner.innerHTML = '<p>No images available</p>';
        return;
    }

    carouselInner.innerHTML = imageUrls.map(url => `<img src="${url}" alt="Dynamic Image" style="width: 100%; height: auto;">`).join('');
}

// Start the automatic image carousel
function startCarousel(imageUrls) {
    const carouselInner = document.getElementById('carouselInner');
    if (!carouselInner || imageUrls.length === 0) return;

    // Set up the carousel container's width
    carouselInner.style.width = `${imageUrls.length * 100}%`;

    setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
        carouselInner.style.transform = `translateX(-${currentImageIndex * (100 / imageUrls.length)}%)`;
    }, CAROUSEL_INTERVAL);
}

// Initialize the carousel on page load
async function initCarousel() {
    const query = 'Farming,fruits,Agriculture'; // Example query for searching images
    const images = await searchImages(query); // Search images based on the query
    displayImages(images);
    startCarousel(images);
}

// Start the carousel when the window loads
window.onload = initCarousel;

//END API

// Navigation
homeBtn.addEventListener('click', showHome);
loginBtn.addEventListener('click', () => showSection('login'));
registerBtn.addEventListener('click', () => showSection('register'));

function showSection(sectionId) {
    Array.from(mainContent.children).forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function showHome() {
    showSection('home');
}

// Authentication
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        updateNavigation();
        if (user.role === 'farmer') {
            showFarmerDashboard();
        } else {
            showBuyerDashboard();
        }
    } else {
        alert('Invalid credentials');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const newUser = { id: users.length + 1, name, email, password, role };
    users.push(newUser);
    alert('Registration successful. Please log in.');
    showSection('login');
});

function updateNavigation() {
    mainNav.innerHTML = '';
    if (currentUser) {
        mainNav.innerHTML = `
            <button id="dashboardBtn" class="nav-btn">Dashboard</button>
            <button id="chatBtn" class="nav-btn">Chat</button>
            <button id="logoutBtn" class="nav-btn">Logout</button>
        `;
        document.getElementById('dashboardBtn').addEventListener('click', () => {
            currentUser.role === 'farmer' ? showFarmerDashboard() : showBuyerDashboard();
        });
        document.getElementById('chatBtn').addEventListener('click', showChat);
        document.getElementById('logoutBtn').addEventListener('click', logout);
    } else {
        mainNav.innerHTML = `
            <button id="homeBtn" class="nav-btn">Home</button>
            <button id="loginBtn" class="nav-btn">Login</button>
            <button id="registerBtn" class="nav-btn">Register</button>
        `;
        document.getElementById('homeBtn').addEventListener('click', showHome);
        document.getElementById('loginBtn').addEventListener('click', () => showSection('login'));
        document.getElementById('registerBtn').addEventListener('click', () => showSection('register'));
    }
}

function logout() {
    currentUser = null;
    updateNavigation();
    showHome();
}

// Farmer Dashboard
function showFarmerDashboard() {
    showSection('farmerDashboard');
    farmerContent.innerHTML = `
        <h3>My Products</h3>
        <div id="farmerProducts"></div>
        <h3>Orders</h3>
        <div id="farmerOrders"></div>
        <h3>Insights</h3>
        <div id="farmerInsights"></div>
    `;
    displayFarmerProducts();
    displayFarmerOrders();
    displayFarmerInsights();
    
    document.getElementById('addProductBtn').addEventListener('click', () => showSection('addProduct'));
    document.getElementById('viewOrdersBtn').addEventListener('click', displayFarmerOrders);
    document.getElementById('farmerInsightsBtn').addEventListener('click', displayFarmerInsights);
}

function displayFarmerProducts() {
    const farmerProducts = document.getElementById('farmerProducts');
    farmerProducts.innerHTML = '';
    products.filter(p => p.farmer === currentUser.name).forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>Price: $${product.price.toFixed(2)} / ${product.unit}</p>
            <p>Quantity: ${product.quantity} ${product.unit}</p>
            <p class="rating">Rating: ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</p>
        `;
        farmerProducts.appendChild(productCard);
    });
}

function displayFarmerOrders() {
    const farmerOrders = document.getElementById('farmerOrders');
    farmerOrders.innerHTML = '<h3>Orders</h3>';
    orders.filter(o => o.farmer === currentUser.name).forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('product-card');
        orderCard.innerHTML = `
            <h4>Order #${order.id}</h4>
            <p>Product: ${order.product}</p>
            <p>Quantity: ${order.quantity} ${order.unit}</p>
            <p>Total: $${order.total.toFixed(2)}</p>
            <p>Status: ${order.status}</p>
        `;
        farmerOrders.appendChild(orderCard);
    });
}

function displayFarmerInsights() {
    const farmerInsights = document.getElementById('farmerInsights');
    farmerInsights.innerHTML = '<h3>Insights</h3>';
    const farmerProducts = products.filter(p => p.farmer === currentUser.name);
    const totalProducts = farmerProducts.length;
    const totalOrders = orders.filter(o => o.farmer === currentUser.name).length;
    const averageRating = farmerProducts.reduce((sum, product) => sum + product.rating, 0) / totalProducts;
    
    farmerInsights.innerHTML += `
        <p>Total Products: ${totalProducts}</p>
        <p>Total Orders: ${totalOrders}</p>
        <p>Average Rating: ${averageRating.toFixed(2)}</p>
    `;
}

// Buyer Dashboard
function showBuyerDashboard() {
    showSection('buyerDashboard');
    buyerContent.innerHTML = `
        <h3>Available Products</h3>
        <div id="productList"></div>
        <h3>My Cart</h3>
        <div id="cart"></div>
        <h3>My Orders</h3>
        <div id="buyerOrders"></div>
    `;
    displayProducts();
    displayCart();
    displayBuyerOrders();
    
    document.getElementById('searchProductsBtn').addEventListener('click', () => showSection('searchProducts'));
    document.getElementById('viewCartBtn').addEventListener('click', displayCart);
    document.getElementById('buyerOrdersBtn').addEventListener('click', displayBuyerOrders);
}

function displayProducts() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>Farmer: ${product.farmer}</p>
            <p>Price: $${product.price.toFixed(2)} / ${product.unit}</p>
            <p>Available: ${product.quantity} ${product.unit}</p>
            <p class="rating">Rating: ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</p>
            <button onclick="addToCart(${product.id})" class="btn-primary">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const cartItem = cart.find(item => item.productId === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ productId, quantity: 1 });
        }
        displayCart();
    }
}

function displayCart() {
    const cartElement = document.getElementById('cart');
    cartElement.innerHTML = '<h3>My Cart</h3>';
    let total = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('product-card');
        cartItemElement.innerHTML = `
            <h4>${product.name}</h4>
            <p>Quantity: ${item.quantity} ${product.unit}</p>
            <p>Price: $${itemTotal.toFixed(2)}</p>
        `;
        cartElement.appendChild(cartItemElement);
    });
    const totalElement = document.createElement('p');
    totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    cartElement.appendChild(totalElement);
    const checkoutButton = document.createElement('button');
    checkoutButton.textContent = 'Checkout';
    checkoutButton.classList.add('btn-primary');
    checkoutButton.addEventListener('click', checkout);
    cartElement.appendChild(checkoutButton);
}

function checkout() {
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const order = {
            id: orders.length + 1,
            buyer: currentUser.name,
            farmer: product.farmer,
            product: product.name,
            quantity: item.quantity,
            unit: product.unit,
            total: product.price * item.quantity,
            status: 'Pending'
        };
        orders.push(order);
        product.quantity -= item.quantity;
    });
    cart = [];
    alert('Checkout successful! Your orders have been placed.');
    showBuyerDashboard();
}

function displayBuyerOrders() {
    const buyerOrders = document.getElementById('buyerOrders');
    buyerOrders.innerHTML = '<h3>My Orders</h3>';
    orders.filter(o => o.buyer === currentUser.name).forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('product-card');
        orderCard.innerHTML = `
            <h4>Order #${order.id}</h4>
            <p>Product: ${order.product}</p>
            <p>Quantity: ${order.quantity} ${order.unit}</p>
            <p>Total: $${order.total.toFixed(2)}</p>
            <p>Status: ${order.status}</p>
        `;
        buyerOrders.appendChild(orderCard);
    });
}

// Chat System
function showChat() {
    showSection('chat');
    displayChatMessages();
}

function displayChatMessages() {
    // In a real application, you would fetch messages from a server
    chatMessages.innerHTML = `
        <div class="chat-message"><span class="sender">System:</span> Welcome to the chat!</div>
    `;
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value;
    if (message.trim()) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `<span class="sender">${currentUser.name}:</span> ${message}`;
        chatMessages.appendChild(messageElement);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

// Add Product
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        id: products.length + 1,
        name: document.getElementById('productName').value,
        farmer: currentUser.name,
        price: parseFloat(document.getElementById('productPrice').value),
        unit: document.getElementById('productUnit').value,
        image: document.getElementById('productImage').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        rating: 0 // New products start with no rating
    };
    products.push(newProduct);
    alert('Product added successfully!');
    showFarmerDashboard();
});

// Search Products
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.farmer.toLowerCase().includes(searchTerm)
    );
    displaySearchResults(filteredProducts);
});

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No products found.</p>';
        return;
    }
    results.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>Farmer: ${product.farmer}</p>
            <p>Price: $${product.price.toFixed(2)} / ${product.unit}</p>
            <p>Available: ${product.quantity} ${product.unit}</p>
            <p class="rating">Rating: ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</p>
            ${currentUser && currentUser.role === 'buyer' ? `<button onclick="addToCart(${product.id})" class="btn-primary">Add to Cart</button>` : ''}
        `;
        searchResults.appendChild(productCard);
    });
}

// Initialize the application
updateNavigation();
showHome();