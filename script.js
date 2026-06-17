/* ============================================
   TASK MANAGER - VANILLA JAVASCRIPT
   DOM APIs, Event Handling & Browser Pipeline
   ============================================ */

// ============================================
// 1. THEME TOGGLE FUNCTIONALITY
// ============================================

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.currentTheme = this.getStoredTheme() || 'light';
        
        this.init();
    }

    init() {
        // Set initial theme from storage or default
        this.setTheme(this.currentTheme);
        
        // Add event listener to theme toggle button
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    getStoredTheme() {
        // Retrieve theme from localStorage
        return localStorage.getItem('app-theme');
    }

    setTheme(theme) {
        // setAttribute() - Sets the data-theme attribute on body element
        // This demonstrates DOM manipulation using setAttribute()
        this.body.setAttribute('data-theme', theme);
        
        // Update button text based on theme
        const isDark = theme === 'dark';
        this.themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        this.themeToggle.setAttribute('data-theme', theme);
        
        // Store theme preference in localStorage
        localStorage.setItem('app-theme', theme);
        
        this.currentTheme = theme;
    }

    toggleTheme() {
        // Toggle between light and dark mode
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// ============================================
// 2. TASK MANAGER APPLICATION
// ============================================

class TaskManager {
    constructor() {
        // DOM Elements
        this.taskForm = document.getElementById('taskForm');
        this.taskTitleInput = document.getElementById('taskTitle');
        this.taskCategorySelect = document.getElementById('taskCategory');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.searchInput = document.getElementById('searchInput');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Stats Elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        
        // Data
        this.tasks = this.loadTasks(); // Load from localStorage
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.init();
    }

    init() {
        // Add event listeners
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.clearAllBtn.addEventListener('click', () => this.handleClearAll());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        
        // Add filter button listeners
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // EVENT DELEGATION: Single listener on container handles all task actions
        // This is more efficient than adding listeners to individual task cards
        this.tasksContainer.addEventListener('click', (e) => this.handleTaskAction(e));
        
        // Initial render
        this.renderTasks();
        this.updateStats();
    }

    // ============================================
    // DOM MANIPULATION: Creating Elements
    // ============================================

    /**
     * Create a new task card dynamically
     * Demonstrates: createElement(), setAttribute(), append()
     */
    createTaskElement(task) {
        // createElement() - Create a new div element
        const taskCard = document.createElement('div');
        
        // setAttribute() - Set custom data attributes
        // These demonstrate "Attributes" (not to be confused with Properties)
        taskCard.setAttribute('data-id', task.id);
        taskCard.setAttribute('data-status', task.completed ? 'completed' : 'pending');
        taskCard.setAttribute('data-category', task.category);
        
        // Set class
        taskCard.className = 'task-card';
        if (task.completed) {
            taskCard.classList.add('completed');
        }

        // Create category badge
        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'task-category';
        categoryBadge.textContent = task.category.toUpperCase();

        // Create title
        const titleEl = document.createElement('h3');
        titleEl.className = 'task-title';
        titleEl.textContent = task.title;

        // Create timestamp
        const timestampEl = document.createElement('p');
        timestampEl.className = 'task-timestamp';
        timestampEl.textContent = `Created: ${new Date(task.createdAt).toLocaleDateString()}`;

        // Create actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // Create Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary';
        editBtn.textContent = '✏️ Edit';
        editBtn.setAttribute('data-action', 'edit');

        // Create Complete button
        const completeBtn = document.createElement('button');
        completeBtn.className = task.completed ? 'btn btn-secondary' : 'btn btn-success';
        completeBtn.textContent = task.completed ? '↩️ Undo' : '✓ Complete';
        completeBtn.setAttribute('data-action', 'complete');

        // Create Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.setAttribute('data-action', 'delete');

        // Append buttons to actions div
        actionsDiv.append(editBtn, completeBtn, deleteBtn);

        // Append all elements to task card using append()
        // append() can take multiple elements
        taskCard.append(categoryBadge, titleEl, timestampEl, actionsDiv);

        return taskCard;
    }

    /**
     * Handle task form submission
     */
    handleAddTask(e) {
        e.preventDefault();

        // Demonstration: Attributes vs Properties
        // ===========================================
        // input.value is a PROPERTY (dynamic, reflects current state)
        // input.getAttribute('value') is an ATTRIBUTE (static, from HTML)
        console.log('=== ATTRIBUTES VS PROPERTIES DEMO ===');
        console.log('input.value (Property):', this.taskTitleInput.value);
        console.log('input.getAttribute("value") (Attribute):', this.taskTitleInput.getAttribute('value'));
        console.log('Difference: Properties are live and change as user types.');
        console.log('Attributes are static HTML values that rarely update.');
        console.log('=====================================\n');

        const title = this.taskTitleInput.value.trim();
        const category = this.taskCategorySelect.value;

        if (!title || !category) {
            alert('Please fill in all fields');
            return;
        }

        // Create new task object
        const task = {
            id: Date.now(),
            title,
            category,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to tasks array
        this.tasks.push(task);
        
        // Save to localStorage
        this.saveTasks();
        
        // Render new task
        this.renderTasks();
        this.updateStats();
        
        // Reset form
        this.taskForm.reset();
    }

    /**
     * EVENT DELEGATION DEMONSTRATION
     * Instead of attaching listeners to each task button,
     * we use a single listener on the container and check
     * the target element (e.target) to determine which action to take
     */
    handleTaskAction(e) {
        // Check if clicked element is a button
        if (!e.target.matches('button[data-action]')) {
            return;
        }

        // Get the task card (closest parent with data-id)
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;

        // Get task ID from data attribute
        const taskId = parseInt(taskCard.getAttribute('data-id'));
        const action = e.target.getAttribute('data-action');

        // Route to appropriate handler
        switch(action) {
            case 'edit':
                this.handleEditTask(taskId, taskCard);
                break;
            case 'complete':
                this.handleCompleteTask(taskId);
                break;
            case 'delete':
                this.handleDeleteTask(taskId);
                break;
        }
    }

    /**
     * Handle edit task
     */
    handleEditTask(taskId, taskCard) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Get current task content and replace with input
        const titleEl = taskCard.querySelector('.task-title');
        const actionsDiv = taskCard.querySelector('.task-actions');

        // Create edit input
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-edit-input';
        editInput.value = task.title;

        // Create save and cancel buttons
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-success';
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';

        const editActionsDiv = document.createElement('div');
        editActionsDiv.className = 'task-edit-actions';
        editActionsDiv.append(saveBtn, cancelBtn);

        // Replace content with edit mode
        titleEl.replaceWith(editInput);
        actionsDiv.replaceWith(editActionsDiv);

        // Focus on input
        editInput.focus();

        // Save handler
        const saveHandler = () => {
            const newTitle = editInput.value.trim();
            if (newTitle) {
                task.title = newTitle;
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
            }
        };

        // Cancel handler
        const cancelHandler = () => {
            this.renderTasks();
            this.updateStats();
        };

        saveBtn.addEventListener('click', saveHandler);
        cancelBtn.addEventListener('click', cancelHandler);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveHandler();
            if (e.key === 'Escape') cancelHandler();
        });
    }

    /**
     * Handle complete/uncomplete task
     */
    handleCompleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    /**
     * Handle delete task
     */
    handleDeleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    /**
     * Handle clear all tasks
     */
    handleClearAll() {
        if (confirm('Clear all tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    /**
     * Handle search input
     */
    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderTasks();
    }

    /**
     * Handle filter buttons
     */
    handleFilter(e) {
        // Remove active class from all buttons
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Update filter
        this.currentFilter = e.target.getAttribute('data-filter');
        
        // Re-render
        this.renderTasks();
    }

    /**
     * Filter and render tasks
     */
    renderTasks() {
        // Clear container
        this.tasksContainer.innerHTML = '';

        // Filter tasks based on search term, category, and completion status
        let filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(this.searchTerm);
            const matchesCategory = this.currentFilter === 'all' || task.category === this.currentFilter;
            return matchesSearch && matchesCategory;
        });

        // If no tasks, show empty state
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = '📭 No tasks found';
            this.tasksContainer.appendChild(emptyState);
            return;
        }

        // Use DocumentFragment for better performance
        // This is a bonus feature: rendering multiple elements efficiently
        const fragment = document.createDocumentFragment();

        // Create task cards
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            fragment.appendChild(taskElement);
        });

        // Append all tasks at once
        this.tasksContainer.appendChild(fragment);
    }

    /**
     * Update statistics
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    }
}

// ============================================
// 3. EVENT PROPAGATION DEMONSTRATION
// ============================================

class EventPropagationDemo {
    constructor() {
        this.grandparent = document.getElementById('grandparent');
        this.parent = document.getElementById('parent');
        this.childBtn = document.getElementById('childBtn');
        this.bubblingBtn = document.getElementById('bubblingBtn');
        this.capturingBtn = document.getElementById('capturingBtn');
        this.clearLogsBtn = document.getElementById('clearLogsBtn');
        this.eventLog = document.getElementById('eventLog');
        
        this.init();
    }

    init() {
        // Add event listeners for demo controls
        this.bubblingBtn.addEventListener('click', () => this.demonstrateBubbling());
        this.capturingBtn.addEventListener('click', () => this.demonstrateCapturing());
        this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
    }

    /**
     * EVENT BUBBLING DEMONSTRATION
     * Events bubble UP the DOM tree from child to parent to grandparent
     * This is the default behavior
     */
    demonstrateBubbling() {
        this.clearLogs();
        console.log('=== EVENT BUBBLING DEMONSTRATION ===');
        console.log('Events start at target and bubble UP to parents');
        console.log('Execution order: Child → Parent → Grandparent\n');

        // Add bubbling listeners (default behavior)
        const childBubblingHandler = () => {
            console.log('1. Child element event fired');
            this.addLog('Child', 'bubbling');
        };

        const parentBubblingHandler = () => {
            console.log('2. Parent element event fired');
            this.addLog('Parent', 'bubbling');
        };

        const grandparentBubblingHandler = () => {
            console.log('3. Grandparent element event fired');
            this.addLog('Grandparent', 'bubbling');
        };

        // Note: addEventListener with no third argument (or false)
        // means the handler uses the bubbling phase
        this.childBtn.addEventListener('click', childBubblingHandler, false);
        this.parent.addEventListener('click', parentBubblingHandler, false);
        this.grandparent.addEventListener('click', grandparentBubblingHandler, false);

        // Simulate click
        this.childBtn.click();

        // Remove listeners after demo
        setTimeout(() => {
            this.childBtn.removeEventListener('click', childBubblingHandler);
            this.parent.removeEventListener('click', parentBubblingHandler);
            this.grandparent.removeEventListener('click', grandparentBubblingHandler);
        }, 100);
    }

    /**
     * EVENT CAPTURING DEMONSTRATION
     * Events capture DOWN the DOM tree from grandparent to parent to child
     * This requires passing true or {capture: true} to addEventListener
     */
    demonstrateCapturing() {
        this.clearLogs();
        console.log('=== EVENT CAPTURING DEMONSTRATION ===');
        console.log('Events start at root and capture DOWN to target');
        console.log('Execution order: Grandparent → Parent → Child\n');

        // Add capturing listeners
        const grandparentCapturingHandler = () => {
            console.log('1. Grandparent element event fired (capturing phase)');
            this.addLog('Grandparent', 'capturing');
        };

        const parentCapturingHandler = () => {
            console.log('2. Parent element event fired (capturing phase)');
            this.addLog('Parent', 'capturing');
        };

        const childCapturingHandler = () => {
            console.log('3. Child element event fired (capturing phase)');
            this.addLog('Child', 'capturing');
        };

        // Note: addEventListener with true (or {capture: true})
        // means the handler uses the capturing phase
        this.grandparent.addEventListener('click', grandparentCapturingHandler, true);
        this.parent.addEventListener('click', parentCapturingHandler, true);
        this.childBtn.addEventListener('click', childCapturingHandler, true);

        // Simulate click
        this.childBtn.click();

        // Remove listeners after demo
        setTimeout(() => {
            this.grandparent.removeEventListener('click', grandparentCapturingHandler, true);
            this.parent.removeEventListener('click', parentCapturingHandler, true);
            this.childBtn.removeEventListener('click', childCapturingHandler, true);
        }, 100);
    }

    /**
     * Add log entry
     */
    addLog(element, phase) {
        const li = document.createElement('li');
        li.className = phase === 'bubbling' ? 'log-bubbling' : 'log-capturing';
        li.textContent = `${element} (${phase.toUpperCase()})`;
        
        // Add to beginning of list for better visibility
        this.eventLog.insertBefore(li, this.eventLog.firstChild);
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.eventLog.innerHTML = '';
    }
}

// ============================================
// 4. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('========================================');
    console.log('TASK MANAGER APPLICATION INITIALIZED');
    console.log('========================================\n');
    console.log('Features Demonstrated:');
    console.log('✅ DOM Manipulation (createElement, setAttribute, append)');
    console.log('✅ Event Delegation (single listener on container)');
    console.log('✅ Event Bubbling & Capturing (see Event Propagation section)');
    console.log('✅ Attributes vs Properties (see console on form submit)');
    console.log('✅ classList & dataset (theme toggle)');
    console.log('✅ LocalStorage Integration (tasks persistence)\n');

    // Initialize Theme Manager
    const themeManager = new ThemeManager();

    // Initialize Task Manager
    const taskManager = new TaskManager();

    // Initialize Event Propagation Demo
    const propagationDemo = new EventPropagationDemo();

    console.log('All systems ready! Start creating tasks.\n');
});

// ============================================
// 5. CONSOLE LOGGING FOR LEARNING
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════╗
║         TASK MANAGER - LEARNING OBJECTIVES                ║
╚════════════════════════════════════════════════════════════╝

📚 CONCEPTS COVERED:

1. HTML & BROWSER RENDERING PIPELINE
   - Parsing: Converting HTML bytes to characters
   - Tokenization: Breaking content into meaningful tokens
   - DOM Tree: Building the document object model
   - CSSOM Tree: Building the CSS object model
   - Render Tree: Combining DOM + CSSOM
   - Layout: Calculating positions and sizes
   - Paint: Drawing pixels to layers
   - Composite: Combining layers for display

2. DOM MANIPULATION
   - createElement(): Create new DOM elements
   - setAttribute(): Set HTML attributes
   - append(): Add elements to the DOM
   - replaceWith(): Replace elements in place
   - classList: Manage CSS classes
   - dataset: Access custom data attributes

3. EVENT HANDLING
   - addEventListener(): Attach event handlers
   - Event.target: Identify the clicked element
   - Event phases: Capturing and Bubbling
   - Event delegation: Single listener for multiple targets

4. ATTRIBUTES vs PROPERTIES
   - Attributes: Static HTML values (getAttribute/setAttribute)
   - Properties: Dynamic JavaScript values (element.value)
   - dataset: Custom data attributes access

5. STORAGE & PERSISTENCE
   - LocalStorage: Persist data across sessions
   - JSON: Serialize/deserialize data

📝 TRY THESE:
1. Create a task and check the console when submitting
2. Click "Show Bubbling" and "Show Capturing" in the Event section
3. Toggle dark/light mode to see theme persistence
4. Refresh the page - your tasks are still there!

💡 REMEMBER:
- Event delegation improves performance
- Bubbling is default; capturing requires true flag
- Properties are live; attributes are static
- LocalStorage keeps data after page reload
`);