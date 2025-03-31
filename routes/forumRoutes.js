const socket = io("http://localhost:5000"); // Connect to backend WebSocket
// const socket = io('https://your-production-url.com'); // Use your production URL
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔍 Forum script loaded');

    // Get DOM elements
    const categoriesView = document.querySelector('.categories-view');
    const categoriesList = document.querySelector('.categories-list');
    const newCategoryBtn = document.getElementById('new-category-btn');
    const newCategorySection = document.querySelector('.new-category-section');
    const newCategoryForm = document.getElementById('new-category-form');
    const closeFormBtn = document.querySelector('.close-form-btn');
    const threadsView = document.querySelector('.threads-view');
    const messagesView = document.querySelector('.messages-view');
    const currentCategory = document.querySelector('.current-category');
    const currentThread = document.querySelector('.current-thread');
    const threadsList = document.querySelector('.threads-list');
    const messagesList = document.querySelector('.messages-list');
    const newThreadBtn = document.getElementById('new-thread-btn');
    const newThreadSection = document.querySelector('.new-thread-section');
    const newThreadForm = document.getElementById('new-thread-form');
    const closeThreadFormBtn = document.querySelector('.close-thread-form-btn');

    // Debug element existence
    console.log('🔍 Elements found:', {
        categoriesView: !!categoriesView,
        categoriesList: !!categoriesList,
        newCategoryBtn: !!newCategoryBtn,
        newCategorySection: !!newCategorySection,
        newCategoryForm: !!newCategoryForm,
        closeFormBtn: !!closeFormBtn,
        newThreadBtn: !!newThreadBtn,
        newThreadSection: !!newThreadSection,
        newThreadForm: !!newThreadForm,
        closeThreadFormBtn: !!closeThreadFormBtn
    });
    document.addEventListener("DOMContentLoaded", () => {
        categoriesList.style.display = "none"; // Hide initially
    });
    // Load categories from MongoDB
    async function loadCategories() {
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const categories = await response.json();

            // Update display based on categories
            categoriesList.innerHTML = ''; // Clear existing categories

            if (categories && categories.length > 0) {
                categoriesList.style.display = "block"; // Show list when categories exist

                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = 'category';
                    li.dataset.categoryId = category._id;
                    li.innerHTML = `
                        <div class="category-header">
                            <span class="category-name">${category.name}</span>
                            <span class="thread-count">${category.threadCount || 0} threads</span>
                        </div>
                        <p class="category-description">${category.description || ''}</p>
                    `;
                    // Add click handler for category
                    li.addEventListener('click', async () => {
                        currentCategory.dataset.categoryId = category._id;
                        currentCategory.textContent = category.name;
                        categoriesView.classList.add('hidden');
                        threadsView.classList.remove('hidden');
                        await loadThreads(category._id);
                    });
                    categoriesList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            // Don't show error, just log it
        }
    }

    async function createCategory() {
        const categoryName = document.getElementById("categoryNameInput").value;

        if (!categoryName.trim()) return alert("Category name cannot be empty!");

        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryName })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            document.getElementById("categoryNameInput").value = ''; // Clear input
            loadCategories(); // ✅ Reload categories after creation
        } catch (error) {
            console.error('❌ Error creating category:', error);
        }
    }


    // Show new category form
    newCategoryBtn?.addEventListener('click', (e) => {
        console.log('🔍 New category button clicked');
        e.preventDefault();
        if (newCategorySection) {
            newCategorySection.classList.remove('hidden');
            console.log('✅ Category form shown');
        } else {
            console.error('❌ New category section not found');
        }
    });

    // Close form button
    closeFormBtn?.addEventListener('click', () => {
        console.log('🔍 Close form button clicked');
        if (newCategorySection) {
            newCategorySection.classList.add('hidden');
            console.log('✅ Category form hidden');
        } else {
            console.error('❌ New category section not found in close handler');
        }
    });

    // New category form submission
    newCategoryForm?.addEventListener('submit', async (e) => {
        console.log('🔍 Form submission started');
        e.preventDefault();

        const name = document.getElementById('category-name').value;
        const description = document.getElementById('category-description').value;

        console.log('📝 Form data:', { name, description });

        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }),
            });

            console.log('🔍 API Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to create category: ${response.status}`);
            }

            const newCategory = await response.json();
            console.log('✅ Category created:', newCategory);

            // Reset and hide form
            newCategoryForm.reset();
            newCategorySection.classList.add('hidden');

            // Reload categories
            await loadCategories();
        } catch (error) {
            console.error('❌ Error creating category:', error);
        }
    });

    // Show new thread form
    newThreadBtn?.addEventListener('click', (e) => {
        console.log('🔍 New thread button clicked');
        e.preventDefault();
        if (newThreadSection) {
            newThreadSection.classList.remove('hidden');
            console.log('✅ Thread form shown');
        } else {
            console.error('❌ New thread section not found');
        }
    });

    // Close thread form
    closeThreadFormBtn?.addEventListener('click', () => {
        console.log('🔍 Close thread form button clicked');
        if (newThreadSection) {
            newThreadSection.classList.add('hidden');
            console.log('✅ Thread form hidden');
        }
    });

    // Handle thread form submission
    newThreadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🔍 Thread form submission started');

        const categoryId = currentCategory.dataset.categoryId;
        const title = document.getElementById('thread-title').value;
        const firstMessage = document.getElementById('thread-first-message').value;

        console.log('📝 Thread data:', { categoryId, title, firstMessage });

        try {
            const response = await fetch('http://localhost:5000/api/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categoryId,
                    title,
                    firstMessage,
                    author: 'Current User'
                }),
            });

            console.log('🔍 API Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to create thread: ${response.status}`);
            }

            const newThread = await response.json();
            console.log('✅ Thread created:', newThread);

            // Reset and hide form
            newThreadForm.reset();
            newThreadSection.classList.add('hidden');

            // Show success notification
            showNotification('Thread created successfully!');

            // Reload threads
            await loadThreads(categoryId);
        } catch (error) {
            console.error('❌ Error creating thread:', error);
            showNotification('Failed to create thread', 'error');
        }
    });

    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Update loadThreads function with more debug info
    async function loadThreads(categoryId) {
        console.log('🔍 loadThreads started for category:', categoryId);

        if (!threadsList) {
            console.error('❌ threadsList element not found');
            return;
        }

        try {
            console.log('🔄 Fetching threads from:', `http://localhost:5000/api/categories/${categoryId}/threads`);
            const response = await fetch(`http://localhost:5000/api/categories/${categoryId}/threads`);

            console.log('🔍 API Response:', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const threads = await response.json();
            console.log('✅ Threads data received:', threads);

            // Clear and update threads list
            threadsList.innerHTML = '';

            if (!threads || threads.length === 0) {
                console.log('ℹ️ No threads found, showing empty state');
                threadsList.innerHTML = `
                    <li class="no-threads">
                        No threads yet. Create one!
                        <style>
                            .no-threads {
                                padding: 20px;
                                text-align: center;
                                color: #666;
                            }
                        </style>
                    </li>`;
            } else {
                console.log('🔄 Rendering threads:', threads.length);
                threads.forEach(thread => {
                    const li = document.createElement('li');
                    li.className = 'thread';
                    li.dataset.threadId = thread._id;
                    li.innerHTML = `
                        <div class="thread-header">
                            <span class="thread-title">${thread.title}</span>
                            <span class="message-count">${thread.messages?.length || 0} messages</span>
                        </div>
                        <div class="thread-meta">
                            <span class="thread-author">By ${thread.author}</span>
                            <span class="thread-date">${new Date(thread.createdAt).toLocaleDateString()}</span>
                        </div>
                    `;
                    threadsList.appendChild(li);
                });
            }

            // Check final state
            console.log('🔍 Final state:', {
                threadsListContent: threadsList.innerHTML,
                threadsViewVisible: !threadsView.classList.contains('hidden'),
                threadsCount: threadsList.children.length
            });

        } catch (error) {
            console.error('❌ Error in loadThreads:', error);
        }
    }

    // Handle category click
    categoriesList.addEventListener('click', async (e) => {
        const categoryItem = e.target.closest('.category');
        if (!categoryItem) {
            console.log('❌ No category item found in click event');
            return;
        }

        const categoryId = categoryItem.dataset.categoryId;
        const categoryName = categoryItem.querySelector('.category-name')?.textContent;

        console.log('🔍 Category clicked:', { categoryId, categoryName });

        // Update current category and show threads view
        currentCategory.textContent = categoryName;
        currentCategory.dataset.categoryId = categoryId;

        categoriesView.classList.add('hidden');
        threadsView.classList.remove('hidden');

        // Show the new thread button
        const newThreadBtn = document.getElementById('new-thread-btn');
        if (newThreadBtn) {
            newThreadBtn.style.display = 'block';
            console.log('✅ New thread button shown');
        }

        await loadThreads(categoryId);
    });

    // Modify addMessage function to use Socket.IO
    async function addMessage(threadId, message) {
        try {
            const response = await fetch(`/api/threads/${threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    author: 'Current User', // Replace with actual user system
                    text: message
                }),
            });
            const updatedThread = await response.json();

            // Emit the new message via Socket.IO
            socket.emit('newMessage', {
                threadId,
                message: {
                    author: 'Current User',
                    text: message,
                    timestamp: new Date()
                }
            });

            displayMessages(updatedThread.messages);
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    // Handle back to categories button
    document.querySelector('.back-to-categories')?.addEventListener('click', () => {
        console.log('🔍 Back to categories clicked');

        // Hide threads view and show categories view
        threadsView.classList.add('hidden');
        categoriesView.classList.remove('hidden');

        // Hide the new thread button
        const newThreadBtn = document.getElementById('new-thread-btn');
        if (newThreadBtn) {
            newThreadBtn.style.display = 'none';
            console.log('✅ New thread button hidden');
        }
    });

    // Prevent header clicks from causing layout shifts
    document.querySelector('.categories-header')?.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    // Handle back to categories button - Add null check
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            threadsView.classList.remove('active');
            threadsView.classList.add('hidden');
            categoriesView.classList.remove('hidden');
            categoriesView.classList.add('active');
        });
    }

    // Handle thread clicks - Add null check
    if (threadsList) {
        threadsList.addEventListener('click', async (e) => {
            const threadElement = e.target.closest('.thread');
            if (!threadElement) return;

            const threadId = parseInt(threadElement.dataset.threadId);
            if (!threadId) return;

            currentThread.dataset.threadId = threadId;

            try {
                const response = await fetch(`/api/threads/${threadId}`);
                const thread = await response.json();

                currentThread.textContent = thread.title;
                threadsView.classList.remove('active');
                threadsView.classList.add('hidden');
                messagesView.classList.remove('hidden');
                messagesView.classList.add('active');

                // Load thread messages
                displayMessages(thread.messages);
            } catch (error) {
                console.error('Error loading thread:', error);
            }
        });
    }

    // Add this after your existing thread click handler
    threadsList.addEventListener('click', async (e) => {
        const threadElement = e.target.closest('.thread');
        if (!threadElement) return;

        const threadId = threadElement.dataset.threadId;
        if (!threadId) return;

        console.log('🔍 Thread clicked:', threadId);

        try {
            const response = await fetch(`http://localhost:5000/api/threads/${threadId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const thread = await response.json();
            console.log('✅ Thread data loaded:', thread);

            // Update UI
            currentThread.textContent = thread.title;
            currentThread.dataset.threadId = threadId;

            // Switch views
            threadsView.classList.add('hidden');
            messagesView.classList.remove('hidden');

            // Load messages
            await loadMessages(threadId);
        } catch (error) {
            console.error('❌ Error loading thread:', error);
        }
    });

    // Add message loading function
    async function loadMessages(threadId) {
        try {
            console.log('🔍 Loading messages for thread:', threadId);
            const response = await fetch(`http://localhost:5000/api/threads/${threadId}/messages`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const messages = await response.json();
            console.log('✅ Messages loaded:', messages);

            const messagesList = document.querySelector('.messages-list');
            messagesList.innerHTML = '';

            if (messages.length === 0) {
                messagesList.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
                return;
            }

            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
                messageElement.innerHTML = `
                    <div class="message-header">
                        <span class="message-author">${msg.author}</span>
                        <span class="message-time">${new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${msg.text}</div>
                `;
                messagesList.appendChild(messageElement);
            });

            // Scroll to bottom
            messagesList.scrollTop = messagesList.scrollHeight;
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        }
    }

    // Add message form handler
    document.getElementById('message-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🔍 Message form submitted');

        const messageInput = document.getElementById('message-input');
        const text = messageInput.value.trim();
        const threadId = currentThread.dataset.threadId;

        if (!text || !threadId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/threads/${threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    author: 'Current User', // Replace with actual user system later
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const newMessage = await response.json();
            console.log('✅ Message sent:', newMessage);

            // Clear input
            messageInput.value = '';

            // Reload messages
            await loadMessages(threadId);
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    });

    // Add back to threads handler
    document.querySelector('.back-to-threads')?.addEventListener('click', () => {
        console.log('🔍 Back to threads clicked');
        messagesView.classList.add('hidden');
        threadsView.classList.remove('hidden');
    });

    // Handle back to threads button - Add null check
    const backToThreadsButton = document.querySelector('.back-to-threads');
    if (backToThreadsButton) {
        backToThreadsButton.addEventListener('click', () => {
            messagesView.classList.remove('active');
            messagesView.classList.add('hidden');
            threadsView.classList.remove('hidden');
            threadsView.classList.add('active');
        });
    }

    // Handle new message submission - Add null check
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input');
            if (!input) return;

            const message = input.value.trim();
            if (message && currentThread) {
                const threadId = currentThread.dataset.threadId;
                await addMessage(threadId, message);
                input.value = '';
            }
        });
    }

    // Listen for real-time messages
    socket.on('messageReceived', (data) => {
        const currentThreadId = currentThread.dataset.threadId;
        if (data.threadId === currentThreadId) {
            const messagesList = document.querySelector('.messages-list');
            const newMessage = `
                <div class="message">
                    <div class="message-header">
                        <span class="message-author">${data.message.author}</span>
                        <span class="message-time">${new Date(data.message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="message-text">${data.message.text}</div>
                </div>
            `;
            messagesList.insertAdjacentHTML('beforeend', newMessage);
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    });

    // Initial categories load
    try {
        console.log('🔍 Loading initial categories...');
        await loadCategories();
        console.log('✅ Initial categories loaded');
    } catch (error) {
        console.error('❌ Error loading initial categories:', error);
    }

    // Add this at the end of your DOMContentLoaded event
    console.log('🎨 Style check:', {
        threadsView: window.getComputedStyle(threadsView),
        threadsList: window.getComputedStyle(threadsList),
        categoriesView: window.getComputedStyle(categoriesView)
    });
});

// Debug socket connection
socket.on('connect', () => {
    console.log('✅ Socket connected');
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
});

// Helper functions
function renderCategories(categories) {
    const categoriesList = document.querySelector('.categories-list');
    categoriesList.innerHTML = categories.map(category => `
        <li class="category" data-category="${category.id}">
            <span class="category-name">${category.name}</span>
        </li>
    `).join('');
}

function renderThreads(threads) {
    threadsList.innerHTML = threads.map(thread => `
        <li class="thread" data-thread-id="${thread.id}">
            <span class="thread-title">${thread.title}</span>
        </li>
    `).join('');
}

function displayMessages(messages) {
    const messagesList = document.querySelector('.messages-list');
    if (!messagesList) return;

    messagesList.innerHTML = '';

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${msg.author}</span>
                <span class="message-time">${new Date(msg.timestamp).toLocaleString()}</span>
            </div>
            <div class="message-content">${msg.text}</div>
        `;
        messagesList.appendChild(messageElement);
    });

    // Scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
}

async function loadThread(threadId) {
    try {
        console.log('🔍 Loading thread:', threadId);
        const response = await fetch(`http://localhost:5000/api/threads/${threadId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Received non-JSON response");
        }

        const thread = await response.json();
        console.log('✅ Thread loaded:', thread);

        // Update UI
        const currentThread = document.querySelector('.current-thread');
        if (currentThread) {
            currentThread.textContent = thread.title;
            currentThread.dataset.threadId = threadId;
        }

        // Load messages
        if (thread.messages && thread.messages.length > 0) {
            displayMessages(thread.messages);
        } else {
            const messagesList = document.querySelector('.messages-list');
            if (messagesList) {
                messagesList.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
            }
        }

        return thread;
    } catch (error) {
        console.error('❌ Error loading thread:', error);
        showNotification('Failed to load thread', 'error');
        throw error;
    }
}
