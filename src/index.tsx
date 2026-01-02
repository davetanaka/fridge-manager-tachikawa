import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import items from './routes/items';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for API routes
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Mount API routes
app.route('/api/items', items);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧊 立川田中家冷蔵庫管理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .status-expired {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
        }
        .status-warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
        }
        .status-normal {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
        }
        .status-no-expiry {
            background-color: #f3f4f6;
            border-left: 4px solid #6b7280;
        }
        .item-card {
            transition: transform 0.2s, box-shadow 0.2s;
            padding: 12px 16px !important;
        }
        .item-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .item-name {
            font-size: 1.125rem;
            font-weight: 700;
            line-height: 1.4;
        }
        .item-expiry {
            font-size: 1rem;
            font-weight: 600;
            margin-left: 0.75rem;
        }
        .item-details {
            font-size: 0.813rem;
            color: #6b7280;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 50;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div class="max-w-4xl mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold">
                <i class="fas fa-snowflake mr-2"></i>
                立川田中家冷蔵庫管理
            </h1>
            <button onclick="showAddModal()" class="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                <i class="fas fa-plus mr-2"></i>追加
            </button>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto p-4">
        <!-- Filters and Sort -->
        <div class="bg-white rounded-lg shadow p-4 mb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">保管場所</label>
                    <select id="storageFilter" onchange="loadItems()" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="all">すべて</option>
                        <option value="main_fridge">🧊 メイン冷蔵庫</option>
                        <option value="main_freezer">❄️ メイン冷凍庫</option>
                        <option value="sub_freezer">🧊 サブ冷凍庫</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
                    <select id="sortBy" onchange="loadItems()" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="expiry">消費期限順</option>
                        <option value="created">登録日順</option>
                        <option value="name">名前順</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Items List -->
        <div id="itemsList" class="space-y-2">
            <div class="text-center text-gray-500 py-8">
                <div class="loading mx-auto mb-4"></div>
                読み込み中...
            </div>
        </div>
    </main>

    <!-- Add/Edit Modal -->
    <div id="itemModal" class="modal">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 id="modalTitle" class="text-xl font-bold text-gray-800">アイテム追加</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <form id="itemForm" onsubmit="saveItem(event)">
                <input type="hidden" id="itemId" value="">
                
                <!-- Item Name -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">アイテム名 *</label>
                    <input type="text" id="itemName" required class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="例：牛乳">
                </div>
                
                <!-- Expiry Date -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">消費期限</label>
                    <input type="date" id="expiryDate" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <div class="flex flex-wrap gap-2 mt-2">
                        <button type="button" onclick="setQuickDate(0)" class="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">今日</button>
                        <button type="button" onclick="setQuickDate(1)" class="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">明日</button>
                        <button type="button" onclick="setQuickDate(3)" class="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">3日後</button>
                        <button type="button" onclick="setQuickDate(7)" class="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">1週間後</button>
                        <button type="button" onclick="clearDate()" class="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">期限なし</button>
                    </div>
                </div>
                
                <!-- Storage Location -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">保管場所 *</label>
                    <select id="storageLocation" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="main_fridge">🧊 メイン冷蔵庫</option>
                        <option value="main_freezer">❄️ メイン冷凍庫</option>
                        <option value="sub_freezer">🧊 サブ冷凍庫</option>
                    </select>
                </div>
                
                <!-- Quantity -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">数量</label>
                    <input type="number" id="quantity" min="1" value="1" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                </div>
                
                <!-- Memo -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                    <textarea id="memo" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="例：開封済み"></textarea>
                </div>
                
                <!-- Buttons -->
                <div class="flex gap-2">
                    <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-save mr-2"></i>保存
                    </button>
                    <button type="button" onclick="closeModal()" class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Consume Modal -->
    <div id="consumeModal" class="modal">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">消費する</h2>
            <p id="consumeItemName" class="text-gray-600 mb-4"></p>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">消費する数量</label>
                <input type="number" id="consumeAmount" min="1" value="1" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-500 mt-1">残り: <span id="currentQuantity"></span>個</p>
            </div>
            
            <div class="flex gap-2">
                <button onclick="consumeItem(false)" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    指定数消費
                </button>
                <button onclick="consumeItem(true)" class="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                    全部消費
                </button>
                <button onclick="closeConsumeModal()" class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    キャンセル
                </button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        let currentItemId = null;
        let currentConsumeItemId = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadItems();
        });

        // Load items from API
        async function loadItems() {
            const storage = document.getElementById('storageFilter').value;
            const sort = document.getElementById('sortBy').value;
            
            try {
                const response = await axios.get('/api/items', {
                    params: { storage, sort, status: 'active' }
                });
                
                if (response.data.success) {
                    displayItems(response.data.items);
                }
            } catch (error) {
                console.error('Error loading items:', error);
                document.getElementById('itemsList').innerHTML = 
                    '<div class="text-center text-red-500 py-8">読み込みエラーが発生しました</div>';
            }
        }

        // Display items
        function displayItems(items) {
            const container = document.getElementById('itemsList');
            
            if (items.length === 0) {
                container.innerHTML = 
                    '<div class="text-center text-gray-500 py-8">アイテムがありません</div>';
                return;
            }
            
            container.innerHTML = items.map(item => {
                const statusClass = getStatusClass(item.days_until_expiry);
                const expiryText = formatExpiryDate(item.expiry_date, item.days_until_expiry);
                const storageIcon = getStorageIcon(item.storage_location);
                
                return \`
                    <div class="item-card \${statusClass} bg-white rounded-lg shadow cursor-pointer"
                         onclick="editItem(\${item.id})">
                        <!-- 1行目: 商品名と消費期限（目立つように） -->
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center flex-1">
                                <span class="item-name text-gray-800">\${item.item_name}</span>
                                <span class="item-expiry text-gray-700">\${expiryText}</span>
                            </div>
                            <div class="flex gap-2 ml-4">
                                <button onclick="showConsumeModal(\${item.id}, '\${item.item_name}', \${item.quantity}); event.stopPropagation();" 
                                        class="text-green-600 hover:text-green-700 text-lg">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                                <button onclick="deleteItem(\${item.id}); event.stopPropagation();" 
                                        class="text-red-600 hover:text-red-700 text-lg">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- 2行目: その他の情報（横並び） -->
                        <div class="item-details flex items-center gap-4">
                            <span>\${storageIcon} \${getStorageLabel(item.storage_location)}</span>
                            <span>📦 \${item.quantity}個</span>
                            \${item.memo ? \`<span><i class="fas fa-sticky-note mr-1"></i>\${item.memo}</span>\` : ''}
                            <span class="ml-auto" style="color: \${item.user_color}">● \${item.user_name}</span>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        // Helper functions
        function getStatusClass(daysUntil) {
            if (daysUntil === null) return 'status-no-expiry';
            if (daysUntil < 0) return 'status-expired';
            if (daysUntil <= 3) return 'status-warning';
            return 'status-normal';
        }

        function formatExpiryDate(date, daysUntil) {
            if (!date) return '期限なし';
            
            const d = new Date(date);
            const month = d.getMonth() + 1;
            const day = d.getDate();
            
            if (daysUntil === null) return '期限なし';
            if (daysUntil < 0) return \`\${month}月\${day}日（\${Math.abs(daysUntil)}日前に期限切れ）\`;
            if (daysUntil === 0) return \`\${month}月\${day}日（今日）\`;
            if (daysUntil === 1) return \`\${month}月\${day}日（明日）\`;
            
            return \`\${month}月\${day}日（あと\${daysUntil}日）\`;
        }

        function getStorageIcon(location) {
            const icons = {
                'main_fridge': '🧊',
                'main_freezer': '❄️',
                'sub_freezer': '🧊'
            };
            return icons[location] || '📦';
        }

        function getStorageLabel(location) {
            const labels = {
                'main_fridge': 'メイン冷蔵庫',
                'main_freezer': 'メイン冷凍庫',
                'sub_freezer': 'サブ冷凍庫'
            };
            return labels[location] || location;
        }

        // Modal functions
        function showAddModal() {
            currentItemId = null;
            document.getElementById('modalTitle').textContent = 'アイテム追加';
            document.getElementById('itemForm').reset();
            document.getElementById('itemId').value = '';
            document.getElementById('itemModal').classList.add('active');
        }

        async function editItem(id) {
            currentItemId = id;
            try {
                const response = await axios.get(\`/api/items/\${id}\`);
                if (response.data.success) {
                    const item = response.data.item;
                    document.getElementById('modalTitle').textContent = 'アイテム編集';
                    document.getElementById('itemId').value = item.id;
                    document.getElementById('itemName').value = item.item_name;
                    document.getElementById('expiryDate').value = item.expiry_date || '';
                    document.getElementById('storageLocation').value = item.storage_location;
                    document.getElementById('quantity').value = item.quantity;
                    document.getElementById('memo').value = item.memo || '';
                    document.getElementById('itemModal').classList.add('active');
                }
            } catch (error) {
                console.error('Error loading item:', error);
                alert('アイテムの読み込みに失敗しました');
            }
        }

        function closeModal() {
            document.getElementById('itemModal').classList.remove('active');
        }

        async function saveItem(event) {
            event.preventDefault();
            
            const id = document.getElementById('itemId').value;
            const data = {
                item_name: document.getElementById('itemName').value,
                expiry_date: document.getElementById('expiryDate').value || null,
                storage_location: document.getElementById('storageLocation').value,
                quantity: parseInt(document.getElementById('quantity').value),
                memo: document.getElementById('memo').value
            };
            
            try {
                if (id) {
                    await axios.put(\`/api/items/\${id}\`, data);
                } else {
                    await axios.post('/api/items', data);
                }
                closeModal();
                loadItems();
            } catch (error) {
                console.error('Error saving item:', error);
                alert('保存に失敗しました');
            }
        }

        async function deleteItem(id) {
            if (!confirm('このアイテムを削除しますか？')) return;
            
            try {
                await axios.delete(\`/api/items/\${id}\`);
                loadItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('削除に失敗しました');
            }
        }

        function setQuickDate(days) {
            const date = new Date();
            date.setDate(date.getDate() + days);
            const dateStr = date.toISOString().split('T')[0];
            document.getElementById('expiryDate').value = dateStr;
        }

        function clearDate() {
            document.getElementById('expiryDate').value = '';
        }

        // Consume modal functions
        function showConsumeModal(id, name, quantity) {
            currentConsumeItemId = id;
            document.getElementById('consumeItemName').textContent = name;
            document.getElementById('currentQuantity').textContent = quantity;
            document.getElementById('consumeAmount').value = 1;
            document.getElementById('consumeAmount').max = quantity;
            document.getElementById('consumeModal').classList.add('active');
        }

        function closeConsumeModal() {
            document.getElementById('consumeModal').classList.remove('active');
        }

        async function consumeItem(consumeAll) {
            const amount = consumeAll ? undefined : parseInt(document.getElementById('consumeAmount').value);
            
            try {
                await axios.post(\`/api/items/\${currentConsumeItemId}/consume\`, { amount });
                closeConsumeModal();
                loadItems();
            } catch (error) {
                console.error('Error consuming item:', error);
                alert('消費処理に失敗しました');
            }
        }
    </script>
</body>
</html>
  `);
});

export default app;
