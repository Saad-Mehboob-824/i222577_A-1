/* script.js */

// State & Data Management
const initData = {
    users: [
        {id:1, name:'Olivia Martin', email:'olivia@example.com', role:'Admin', status:'Active'},
        {id:2, name:'Jackson Lee', email:'jackson@example.com', role:'User', status:'Inactive'},
        {id:3, name:'Isabella Nguyen', email:'isa@example.com', role:'User', status:'Active'}
    ],
    products: [
        {id:1, name:'Ergonomic Chair', price:249, qty:42, status:'In Stock', pic:'solar:chair-linear'},
        {id:2, name:'Mechanical Keyboard', price:129, qty:0, status:'Out of Stock', pic:'solar:keyboard-linear'},
        {id:3, name:'Wireless Mouse', price:59, qty:18, status:'In Stock', pic:'solar:mouse-linear'}
    ],
    notifications: [
        {id:1, text:'New user registered: Isabella', read:false, time:'2h ago'},
        {id:2, text:'System update completed', read:true, time:'1d ago'}
    ],
    settings: { name:'Admin User', email:'admin@nexus.com', dark:false }
};

let state = {};
let currentUser = null;
let editId = null;
let charts = {};

function loadState() {
    const stored = localStorage.getItem('nexus_data');
    if (stored) state = JSON.parse(stored);
    else { state = {...initData}; saveState(); }
    
    const html = document.documentElement;
    if(state.settings.dark) html.classList.add('dark');
    else html.classList.remove('dark');
    
    currentUser = sessionStorage.getItem('nexus_auth');
}

function saveState() { localStorage.setItem('nexus_data', JSON.stringify(state)); }

// Navigation
function navigateTo(page) {
    if (page === 'login') window.location.href = 'login.html';
    else if (page === 'signup') window.location.href = 'signup.html';
    else if (page === 'dashboard') window.location.href = 'dashboard.html';
    else if (page === 'users') window.location.href = 'users.html';
    else if (page === 'products') window.location.href = 'products.html';
    else if (page === 'analytics') window.location.href = 'analytics.html';
    else if (page === 'notifications') window.location.href = 'notifications.html';
    else if (page === 'settings') window.location.href = 'settings.html';
    else if (page === 'landing') window.location.href = 'index.html';
}

// Auth Logic
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    const errEl = document.getElementById('auth-error');
    errEl.classList.add('hidden');
    
    const users = JSON.parse(localStorage.getItem('nexus_accounts') || '[]');
    const u = users.find(u => u.email === email && u.pass === pass);
    if(email === 'admin@nexus.com' && pass === 'admin') {
        sessionStorage.setItem('nexus_auth', JSON.stringify({name:'Admin', email}));
        navigateTo('dashboard');
    } else if(u) {
        sessionStorage.setItem('nexus_auth', JSON.stringify({name:u.name, email:u.email}));
        navigateTo('dashboard');
    } else {
        errEl.textContent = "Invalid email or password";
        errEl.classList.remove('hidden');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const errEl = document.getElementById('auth-error');
    errEl.classList.add('hidden');
    const name = document.getElementById('auth-name').value;
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    const conf = document.getElementById('auth-confirm').value;
    
    if(pass !== conf) { errEl.textContent = "Passwords do not match"; errEl.classList.remove('hidden'); return; }
    const users = JSON.parse(localStorage.getItem('nexus_accounts') || '[]');
    if(users.find(u => u.email === email)) { errEl.textContent = "Email already exists"; errEl.classList.remove('hidden'); return; }
    users.push({name, email, pass});
    localStorage.setItem('nexus_accounts', JSON.stringify(users));
    sessionStorage.setItem('nexus_auth', JSON.stringify({name, email}));
    navigateTo('dashboard');
}

function logout() { 
    sessionStorage.removeItem('nexus_auth'); 
    navigateTo('landing'); 
}

// Check auth on protected pages
function checkAuth() {
    if (!currentUser) {
        navigateTo('login');
    } else {
        const user = JSON.parse(currentUser);
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.checked = state.settings.dark;
        updateNotifBadge();
    }
}

// Sidebar
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('-translate-x-full');
}

// Floating Notification Panel
function toggleNotifPanel() {
    const panel = document.getElementById('notif-panel');
    if(panel) {
        panel.classList.toggle('hidden');
        if(!panel.classList.contains('hidden')) {
            renderNotificationPanel();
        }
    }
}

// --- DASHBOARD ---
function renderDashboard() {
    const rev = state.products.reduce((acc, p) => acc + (p.price * (Math.floor(Math.random()*10))), 15400);
    document.getElementById('dash-rev').textContent = '$' + rev.toLocaleString();
    document.getElementById('dash-users').textContent = state.users.length;
    document.getElementById('dash-orders').textContent = Math.floor(Math.random() * 100) + 20;

    if(charts.dash) charts.dash.destroy();
    const ctx = document.getElementById('dashChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const gridCol = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const textCol = isDark ? '#a1a1aa' : '#71717a';

    Chart.defaults.font.family = 'Inter';
    charts.dash = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 22000, 18000, 24000],
                borderColor: isDark ? '#f4f4f5' : '#18181b',
                backgroundColor: isDark ? 'rgba(244, 244, 245, 0.1)' : 'rgba(24, 24, 27, 0.05)',
                borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textCol, font:{size:11} } },
                y: { grid: { color: gridCol }, ticks: { color: textCol, font:{size:11} } }
            }
        }
    });
}

// --- USERS ---
function renderUsers() {
    const q = document.getElementById('user-search').value.toLowerCase();
    const tbody = document.getElementById('user-tbody');
    tbody.innerHTML = '';
    let filtered = state.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    
    filtered.forEach(u => {
        const statusColor = u.status === 'Active' ? 'bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400';
        tbody.innerHTML += `
            <tr class="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors group">
                <td class="px-4 py-3"><div class="font-medium text-zinc-900 dark:text-zinc-100">${u.name}</div></td>
                <td class="px-4 py-3">${u.email}</td>
                <td class="px-4 py-3">${u.role}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor}">${u.status}</span></td>
                <td class="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openUserModal(${u.id})" class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"><iconify-icon icon="solar:pen-linear"></iconify-icon></button>
                    <button onclick="delUser(${u.id})" class="text-zinc-400 hover:text-red-500 p-1"><iconify-icon icon="solar:trash-bin-trash-linear"></iconify-icon></button>
                </td>
            </tr>
        `;
    });
    if(!filtered.length) tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-zinc-400 text-xs">No users found</td></tr>`;
}

function delUser(id) { 
    state.users = state.users.filter(u => u.id !== id); 
    saveState(); 
    renderUsers(); 
}

// --- PRODUCTS ---
function renderProducts() {
    const q = document.getElementById('prod-search').value.toLowerCase();
    const sort = document.getElementById('prod-sort').value;
    const tbody = document.getElementById('prod-tbody');
    tbody.innerHTML = '';
    
    let filtered = state.products.filter(p => p.name.toLowerCase().includes(q));
    filtered.sort((a,b) => sort==='price' ? a.price - b.price : a.name.localeCompare(b.name));

    filtered.forEach(p => {
        const statusColor = p.status === 'In Stock' ? 'text-green-600 dark:text-green-400' : 'text-red-500';
        tbody.innerHTML += `
            <tr class="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors group">
                <td class="px-4 py-3 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-md bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500"><iconify-icon icon="${p.pic}"></iconify-icon></div>
                    <div class="font-medium text-zinc-900 dark:text-zinc-100">${p.name}</div>
                </td>
                <td class="px-4 py-3">$${p.price}</td>
                <td class="px-4 py-3">${p.qty}</td>
                <td class="px-4 py-3 ${statusColor} text-xs font-medium">${p.status}</td>
                <td class="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openProdModal(${p.id})" class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"><iconify-icon icon="solar:pen-linear"></iconify-icon></button>
                    <button onclick="delProd(${p.id})" class="text-zinc-400 hover:text-red-500 p-1"><iconify-icon icon="solar:trash-bin-trash-linear"></iconify-icon></button>
                </td>
            </tr>
        `;
    });
    if(!filtered.length) tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-zinc-400 text-xs">No products found</td></tr>`;
}

function delProd(id) { 
    state.products = state.products.filter(p => p.id !== id); 
    saveState(); 
    renderProducts(); 
}

// --- ANALYTICS ---
function renderAnalytics() {
    if(charts.pie) charts.pie.destroy();
    if(charts.bar) charts.bar.destroy();
    
    const isDark = document.documentElement.classList.contains('dark');
    const gridCol = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const textCol = isDark ? '#a1a1aa' : '#71717a';
    const bg1 = isDark ? '#f4f4f5' : '#18181b';
    const bg2 = isDark ? '#a1a1aa' : '#71717a';
    const bg3 = isDark ? '#52525b' : '#d4d4d8';

    charts.pie = new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Direct', 'Social', 'Referral'],
            datasets: [{ data: [55, 30, 15], backgroundColor: [bg1, bg2, bg3], borderWidth: 0, cutout:'70%' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: {color: textCol, font:{size:11}, usePointStyle: true, boxWidth: 8} } } }
    });

    charts.bar = new Chart(document.getElementById('barChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ label: 'Conversions', data: [12, 19, 15, 25, 22, 10, 8], backgroundColor: bg1, borderRadius: 4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textCol, font:{size:11} } },
                y: { grid: { color: gridCol }, ticks: { color: textCol, font:{size:11} } }
            }
        }
    });
}

// --- NOTIFICATIONS ---
function renderNotificationPanel() {
    const list = document.getElementById('notif-panel-list');
    if(!list) return;
    list.innerHTML = '';
    state.notifications.forEach(n => {
        const markBtn = !n.read ? `<button onclick="markRead(${n.id})" class="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">✓</button>` : '';
        list.innerHTML += `
            <div class="p-3 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-start transition-all group">
                <div class="flex gap-2 items-start flex-1">
                    <div class="mt-0.5 text-sm"><iconify-icon icon="solar:bell-bing-linear"></iconify-icon></div>
                    <div class="flex-1">
                        <p class="text-xs font-medium text-zinc-900 dark:text-zinc-100">${n.text}</p>
                        <p class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">${n.time}</p>
                    </div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${markBtn}
                    <button onclick="delNotif(${n.id})" class="text-[10px] text-zinc-400 hover:text-red-500">✕</button>
                </div>
            </div>
        `;
    });
    if(!state.notifications.length) list.innerHTML = '<div class="text-center py-6 text-xs text-zinc-500">No notifications</div>';
    updateNotifBadge();
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    if(!list) return;
    list.innerHTML = '';
    state.notifications.forEach(n => {
        list.innerHTML += `
            <div class="p-3 rounded-lg border ${n.read ? 'bg-transparent border-transparent opacity-60' : 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-white/60 dark:border-zinc-800/60 shadow-sm'} flex justify-between items-start transition-all group">
                <div class="flex gap-3 items-start">
                    <div class="mt-0.5 ${n.read ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}"><iconify-icon icon="solar:bell-bing-linear"></iconify-icon></div>
                    <div>
                        <p class="text-sm ${n.read ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100 font-medium'}">${n.text}</p>
                        <p class="text-xs text-zinc-400 mt-1">${n.time}</p>
                    </div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${!n.read ? `<button onclick="markRead(${n.id})" class="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Mark read</button>` : ''}
                    <button onclick="delNotif(${n.id})" class="text-xs text-red-400 hover:text-red-500"><iconify-icon icon="solar:trash-bin-trash-linear"></iconify-icon></button>
                </div>
            </div>
        `;
    });
    if(!state.notifications.length) list.innerHTML = `<div class="text-center py-8 text-sm text-zinc-500">Inbox is empty</div>`;
    updateNotifBadge();
}

function markRead(id) { 
    state.notifications.find(n => n.id === id).read = true; 
    saveState(); 
    renderNotifications(); 
}

function delNotif(id) { 
    state.notifications = state.notifications.filter(n => n.id !== id); 
    saveState(); 
    renderNotifications(); 
}

function clearNotifs() { 
    state.notifications = []; 
    saveState(); 
    renderNotifications(); 
}

function updateNotifBadge() {
    const unread = state.notifications.filter(n=>!n.read).length;
    const b = document.getElementById('notif-badge');
    if(b) {
        if(unread > 0) { 
            b.textContent = unread; 
            b.classList.remove('hidden'); 
        } else { 
            b.classList.add('hidden'); 
        }
    }
}

// --- SETTINGS ---
function saveProfile(e) {
    e.preventDefault();
    state.settings.name = document.getElementById('set-name').value;
    state.settings.email = document.getElementById('set-email').value;
    saveState();
    alert('Profile saved!');
}

function changePass(e) { 
    e.preventDefault(); 
    const newP = document.getElementById('new-pass').value;
    const confP = document.getElementById('confirm-pass').value;
    if(newP !== confP) { alert('Passwords do not match'); return; }
    // Mock change
    alert('Password updated!'); 
    e.target.reset();
}

// --- THEME TOGGLE ---
function toggleThemeSettings(e) {
    applyTheme(e.target.checked);
}

function toggleThemeGlobal() {
    const isDark = !document.documentElement.classList.contains('dark');
    applyTheme(isDark);
}

function applyTheme(isDark) {
    state.settings.dark = isDark;
    saveState();
    
    if(isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    const setToggle = document.getElementById('theme-toggle');
    if(setToggle) setToggle.checked = isDark;

    // Re-render charts if on those pages
    if(document.getElementById('dashChart')) renderDashboard();
    if(document.getElementById('pieChart')) renderAnalytics();
}

// --- MODALS ---
const ovl = document.getElementById('modal-overlay');

function showModal(title, html) {
    if(!ovl) return;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    ovl.classList.remove('hidden');
    setTimeout(() => { ovl.classList.remove('opacity-0'); document.getElementById('modal-content').classList.remove('scale-95'); }, 10);
}

function closeModal() {
    if(!ovl) return;
    ovl.classList.add('opacity-0'); 
    document.getElementById('modal-content').classList.add('scale-95');
    setTimeout(() => { ovl.classList.add('hidden'); }, 200);
    editId = null;
}

// User Modal
function openUserModal(id = null) {
    editId = id;
    const u = id ? state.users.find(x => x.id === id) : {name:'', email:'', role:'User', status:'Active'};
    const html = `
        <form onsubmit="saveUser(event)" class="space-y-4 text-zinc-900 dark:text-zinc-100">
            <div class="space-y-1">
                <label class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input type="text" id="m-uname" value="${u.name}" required class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-100 backdrop-blur-sm transition-colors">
            </div>
            <div class="space-y-1">
                <label class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input type="email" id="m-uemail" value="${u.email}" required class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-100 backdrop-blur-sm transition-colors">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-xs font-medium">Role</label>
                    <select id="m-urole" class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-2 py-1.5 text-sm outline-none backdrop-blur-sm transition-colors">
                        <option value="User" ${u.role==='User'?'selected':''}>User</option><option value="Admin" ${u.role==='Admin'?'selected':''}>Admin</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-medium">Status</label>
                    <select id="m-ustatus" class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-2 py-1.5 text-sm outline-none backdrop-blur-sm transition-colors">
                        <option value="Active" ${u.status==='Active'?'selected':''}>Active</option><option value="Inactive" ${u.status==='Inactive'?'selected':''}>Inactive</option>
                    </select>
                </div>
            </div>
            <button type="submit" class="w-full bg-zinc-900/90 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100/90 dark:text-zinc-900 py-2 rounded-md text-sm font-medium mt-4 backdrop-blur-sm transition-colors shadow-sm">Save User</button>
        </form>
    `;
    showModal(id ? 'Edit User' : 'Add User', html);
}

function saveUser(e) {
    e.preventDefault();
    const data = {
        id: editId || Date.now(),
        name: document.getElementById('m-uname').value,
        email: document.getElementById('m-uemail').value,
        role: document.getElementById('m-urole').value,
        status: document.getElementById('m-ustatus').value
    };
    if(editId) { 
        const idx = state.users.findIndex(x=>x.id===editId); 
        state.users[idx] = data; 
    } else { 
        state.users.push(data); 
    }
    saveState(); 
    closeModal(); 
    renderUsers();
}

// Product Modal
function openProdModal(id = null) {
    editId = id;
    const p = id ? state.products.find(x => x.id === id) : {name:'', price:'', qty:0, status:'In Stock', pic:'solar:box-linear'};
    const html = `
        <form onsubmit="saveProd(event)" class="space-y-4 text-zinc-900 dark:text-zinc-100">
            <div class="space-y-1">
                <label class="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input type="text" id="m-pname" value="${p.name}" required class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-100 backdrop-blur-sm transition-colors">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-xs font-medium">Price ($)</label>
                    <input type="number" id="m-pprice" value="${p.price}" required class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-100 backdrop-blur-sm transition-colors">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-medium">Quantity</label>
                    <input type="number" id="m-pqty" value="${p.qty}" required class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-3 py-1.5 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-100 backdrop-blur-sm transition-colors">
                </div>
            </div>
            <div class="space-y-1">
                <label class="text-xs font-medium">Status</label>
                <select id="m-pstatus" class="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-md px-2 py-1.5 text-sm outline-none backdrop-blur-sm transition-colors">
                    <option value="In Stock" ${p.status==='In Stock'?'selected':''}>In Stock</option><option value="Out of Stock" ${p.status==='Out of Stock'?'selected':''}>Out of Stock</option>
                </select>
            </div>
            <button type="submit" class="w-full bg-zinc-900/90 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100/90 dark:text-zinc-900 py-2 rounded-md text-sm font-medium mt-4 backdrop-blur-sm transition-colors shadow-sm">Save Product</button>
        </form>
    `;
    showModal(id ? 'Edit Product' : 'Add Product', html);
}

function saveProd(e) {
    e.preventDefault();
    const data = {
        id: editId || Date.now(),
        name: document.getElementById('m-pname').value,
        price: Number(document.getElementById('m-pprice').value),
        qty: Number(document.getElementById('m-pqty').value),
        status: document.getElementById('m-pstatus').value,
        pic: editId ? state.products.find(x=>x.id===editId).pic : 'solar:box-linear'
    };
    if(editId) { 
        const idx = state.products.findIndex(x=>x.id===editId); 
        state.products[idx] = data; 
    } else { 
        state.products.push(data); 
    }
    saveState(); 
    closeModal(); 
    renderProducts();
}

// Init
loadState();

// Page-specific init
if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
    renderDashboard();
} else if (window.location.pathname.includes('users.html')) {
    checkAuth();
    renderUsers();
} else if (window.location.pathname.includes('products.html')) {
    checkAuth();
    renderProducts();
} else if (window.location.pathname.includes('analytics.html')) {
    checkAuth();
    renderAnalytics();
} else if (window.location.pathname.includes('settings.html')) {
    checkAuth();
    document.getElementById('set-name').value = state.settings.name;
    document.getElementById('set-email').value = state.settings.email;
} else if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
    // No auth check
} else {
    // Landing
}