// Gestión de la lista de la compra con almacenamiento en localStorage
const form = document.getElementById('product-form');
const nameInput = document.getElementById('product-name');
const qtyInput = document.getElementById('product-qty');
const listEl = document.getElementById('product-list');
const totalCountEl = document.getElementById('total-count');
const boughtCountEl = document.getElementById('bought-count');
const freqListEl = document.getElementById('freq-list');
const clearAllBtn = document.getElementById('clear-all');
const filters = document.querySelectorAll('.filter');
let chart;

// Cargar datos almacenados
let products = JSON.parse(localStorage.getItem('products')) || [];

function save() {
    localStorage.setItem('products', JSON.stringify(products));
}

function render() {
    // Filtrado actual
    const activeFilter = document.querySelector('.filter.active').dataset.filter;
    listEl.innerHTML = '';
    products.forEach((product, index) => {
        if (activeFilter === 'pending' && product.bought) return;
        if (activeFilter === 'completed' && !product.bought) return;
        const li = document.createElement('li');
        li.className = 'product-item' + (product.bought ? ' bought' : '');
        li.innerHTML = `
            <span>${product.name} - ${product.qty}</span>
            <div>
                <input type="checkbox" ${product.bought ? 'checked' : ''} data-index="${index}" class="toggle">
                <button data-index="${index}" class="delete">Eliminar</button>
            </div>`;
        listEl.appendChild(li);
    });
    updateStats();
    updateChart();
}

function updateStats() {
    totalCountEl.textContent = products.length;
    const bought = products.filter(p => p.bought).length;
    boughtCountEl.textContent = bought;
    // Calcular frecuencia
    const freq = {};
    products.forEach(p => { freq[p.name] = (freq[p.name] || 0) + 1; });
    freqListEl.innerHTML = '';
    Object.entries(freq)
        .sort((a,b) => b[1]-a[1])
        .forEach(([name,count]) => {
            const li = document.createElement('li');
            li.textContent = `${name}: ${count}`;
            freqListEl.appendChild(li);
        });
}

function updateChart() {
    const freq = {};
    products.forEach(p => { freq[p.name] = (freq[p.name] || 0) + 1; });
    const labels = Object.keys(freq);
    const data = Object.values(freq);
    if (chart) chart.destroy();
    chart = new Chart(document.getElementById('chart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Añadidos', data, backgroundColor: '#4e73df' }]
        }
    });
}

function addProduct(e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    const qty = parseInt(qtyInput.value, 10);
    if (!name) return alert('Introduce un nombre');
    if (products.find(p => p.name === name)) return alert('Producto duplicado');
    products.push({ name, qty, bought: false });
    save();
    render();
    form.reset();
    qtyInput.value = 1;
}

function toggleBought(index) {
    products[index].bought = !products[index].bought;
    save();
    render();
}

function deleteProduct(index) {
    products.splice(index,1);
    save();
    render();
}

function clearAll() {
    if (confirm('¿Vaciar toda la lista?')) {
        products = [];
        save();
        render();
    }
}

form.addEventListener('submit', addProduct);
listEl.addEventListener('click', e => {
    if (e.target.classList.contains('delete')) deleteProduct(e.target.dataset.index);
    if (e.target.classList.contains('toggle')) toggleBought(e.target.dataset.index);
});
clearAllBtn.addEventListener('click', clearAll);
filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
}));

render();
