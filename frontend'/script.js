

const API_URL = "https://gymtracker-gx6e.onrender.com/api/gym-users/";

const form = document.getElementById("gymForms");
const tableBody = document.getElementById("tableBody");

async function loadUsers() {
    const res = await fetch(API_URL);
    const data = await res.json();

    tableBody.innerHTML = "";
    data.forEach(user => {
        tableBody.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.age}</td>
                <td>${user.weight}</td>
                <td>${user.workout}</td>
            </tr>
        `;
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
        name: document.getElementById("name").value,
        age: parseInt(document.getElementById("age").value),
        weight: parseFloat(document.getElementById("weight").value),
        workout: document.getElementById("workout").value
    };

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    form.reset();
    loadUsers();
});

loadUsers();

        // ===========================================
        // ENHANCED ELITE WORKOUT TRACKER CLASS
        // ===========================================
        class EliteWorkoutTracker {
            static LOCAL_STORAGE_DATA_KEY = "elite-gym-tracker-pro-v2";

            constructor(root) {
                this.root = root;
                this.entries = [];
                this.loadEntries();
                this.render();
                this.bindEvents();
                this.renderEntries();
            }

            loadEntries() {
                try {
                    this.entries = JSON.parse(localStorage.getItem(EliteWorkoutTracker.LOCAL_STORAGE_DATA_KEY) || "[]");
                } catch (e) {
                    this.entries = [];
                }
                this.updateStats();
            }

            saveEntries() {
                localStorage.setItem(EliteWorkoutTracker.LOCAL_STORAGE_DATA_KEY, JSON.stringify(this.entries));
                this.updateStats();
            }

            updateStats() {
                const totalWorkouts = this.entries.length;
                const totalMinutes = this.entries.reduce((sum, entry) => sum + (parseInt(entry.duration) || 0), 0);
                const avgDuration = totalWorkouts ? Math.round(totalMinutes / totalWorkouts) : 0;
                
                // Calculate streak (consecutive workout days)
                const sortedEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
                let streak = 0;
                const today = new Date();
                const yesterday = new Date(today.getTime() - 86400000);
                
                for (let i = 0; i < sortedEntries.length; i++) {
                    const entryDate = new Date(sortedEntries[i].date);
                    if (entryDate.toDateString() === today.toDateString() || 
                        entryDate.toDateString() === yesterday.toDateString()) {
                        streak++;
                    } else {
                        break;
                    }
                }

                document.getElementById('total-workouts').textContent = totalWorkouts.toLocaleString();
                document.getElementById('total-minutes').textContent = totalMinutes.toLocaleString();
                document.getElementById('avg-duration').textContent = avgDuration + 'm';
                document.getElementById('streak').textContent = streak;
            }

            render() {
                const html = `
                    <table class="tracker">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Exercise</th>
                                <th>Sets × Reps</th>
                                <th>Weight</th>
                                <th>Duration</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody class="tracker__entries"></tbody>
                        <tbody>
                            <tr class="tracker__row tracker__row--add">
                                <td colspan="7">
                                    <button class="tracker__add">➕ Log New Workout Session</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="text-align: center; margin-top: 2rem; padding: 1.5rem; background: rgba(78,205,196,0.1); border-radius: 15px;">
                        <small style="opacity: 0.8;">💡 Pro Tip: All data saved locally. Refresh-safe & mobile-friendly!</small>
                    </div>
                `;
                this.root.innerHTML = html;
            }

            bindEvents() {
                this.root.addEventListener('click', (e) => {
                    if (e.target.matches('.tracker__add')) {
                        const date = new Date().toISOString().split('T')[0];
                        this.addEntry({
                            date,
                            exercise: "Bench Press",
                            setsReps: "3×10",
                            weight: 60,
                            duration: 45,
                            notes: "Progressive overload"
                        });
                    }
                });
            }

            addEntry(data) {
                this.entries.unshift(data);
                if (this.entries.length > 1000) { // Limit storage
                    this.entries = this.entries.slice(0, 1000);
                }
                this.saveEntries();
                this.renderEntries();
            }

            renderEntries() {
                const tbody = this.root.querySelector(".tracker__entries");
                tbody.innerHTML = "";
                
                this.entries.forEach((entry, index) => {
                    const row = document.createElement("tr");
                    row.className = "tracker__row";
                    row.innerHTML = `
                        <td><input type="date" class="tracker__input tracker__date" value="${entry.date}"></td>
                        <td><input type="text" class="tracker__input tracker__exercise" value="${entry.exercise}" placeholder="e.g. Squats"></td>
                        <td><input type="text" class="tracker__input tracker__sets" value="${entry.setsReps}" placeholder="3×12"></td>
                        <td><input type="number" class="tracker__input tracker__weight" value="${entry.weight}" placeholder="0" min="0" step="0.5"></td>
                        <td><input type="number" class="tracker__input tracker__duration" value="${entry.duration}" placeholder="0" min="1"></td>
                        <td><input type="text" class="tracker__input tracker__notes" value="${entry.notes}" placeholder="How it felt?"></td>
                        <td><button type="button" class="tracker__button tracker__delete" data-index="${index}">🗑️</button></td>
                    `;
                    
                    // Bind change events
                    const inputs = row.querySelectorAll('.tracker__input');
                    const fields = ['date', 'exercise', 'setsReps', 'weight', 'duration', 'notes'];
                    inputs.forEach((input, i) => {
                        input.addEventListener('change', () => {
                            entry[fields[i]] = input.value;
                            this.saveEntries();
                        });
                        input.addEventListener('blur', () => {
                            if (!input.value.trim()) {
                                input.value = entry[fields[i]] || '';
                            }
                        });
                    });
                    
                    // Delete button
                    row.querySelector('.tracker__delete').addEventListener('click', (e) => {
                        const deleteIndex = parseInt(e.target.dataset.index);
                        this.entries.splice(deleteIndex, 1);
                        this.saveEntries();
                        this.renderEntries();
                    });
                    
                    tbody.appendChild(row);
                });
            }
        }

        // ===========================================
        // GLOBAL INTERACTIONS & ANIMATIONS
        // ===========================================
        
        // Initialize tracker
        document.addEventListener('DOMContentLoaded', () => {
            const app = document.getElementById("app");
            new EliteWorkoutTracker(app);
        });

        // Navbar scroll effects
        let lastScrollY = 0;
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            
            // Background opacity
            const scrollPercent = Math.min(window.scrollY / 500, 1);
            navbar.style.background = `rgba(0,0,0,${0.95 + scrollPercent * 0.05})`;
            
            // Hide/show on scroll direction
            if (window.scrollY > lastScrollY && window.scrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        });

        // Mobile hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');
        
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                // Close mobile menu
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Scroll-triggered animations
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Performance: Preload critical images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
        });

        // Add PWA-like install prompt (optional)
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
        });

        console.log('🌟 Elite Gym Tracker Pro v2.0 loaded successfully!');
        console.log('💾 Data stored in localStorage: elite-gym-tracker-pro-v2');
        console.log('📱 Fully responsive | ⚡ Vanilla JS | 🎨 CSS3 Animations');
    // Simple modal handler for gym cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.gym-card');
    const modals = document.querySelectorAll('.modal');
    const closes = document.querySelectorAll('.close');

    // Open modal on card click
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });
    });

    // Close modal on X click
    closes.forEach(close => {
        close.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Close on outside click
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const mapButtons = document.querySelectorAll('.maps-btn');
    
    mapButtons.forEach(btn => {
        // Touch feedback for mobile
        btn.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', function(e) {
            this.style.transform = '';
        });
        
        btn.addEventListener('click', function() {
            // Haptic feedback simulation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            console.log('✅ Maps opened for Cult Fit Banjara Hills');
        });
    });
});

// subscription
class GymSubscription {
    constructor() {
        this.init();
    }

    init() {
        this.userData = {};
        this.selectedPlan = null;
        
        // User form submit
        document.querySelector('.user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.collectUserData();
            this.showPlans();
        });

        // Plan selection
        document.querySelectorAll('.plan-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectPlan(e.currentTarget.dataset.duration);
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });

        // Payment form
        document.querySelector('.payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Format card input
        this.formatCardNumber();
    }

    collectUserData() {
        this.userData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            age: document.getElementById('user-age').value,
            weight: document.getElementById('user-weight').value,
            gymType: document.getElementById('gym-type').value,
            description: document.getElementById('user-desc').value
        };
    }

    showPlans() {
        document.getElementById('user-info').textContent = 
            `${this.userData.name}, ${this.userData.gymType} plan ready!`;
        
        this.switchStep('user-form', 'plans');
    }

    selectPlan(duration) {
        this.selectedPlan = {
            duration: parseInt(duration),
            price: document.querySelector(`[data-duration="${duration}"]`).dataset.price
        };
        
        document.getElementById('plan-summary').innerHTML = 
            `Plan: ${this.selectedPlan.duration} months | Total: ₹${this.selectedPlan.price}`;
        document.getElementById('final-amount').textContent = this.selectedPlan.price;
        
        this.switchStep('plans', 'payment');
    }

    goBack() {
        const activeStep = document.querySelector('.sub-step.active');
        if (activeStep.id === 'plans') {
            this.switchStep('plans', 'user-form');
        } else if (activeStep.id === 'payment') {
            this.switchStep('payment', 'plans');
        }
    }

    switchStep(hideId, showId) {
        document.getElementById(hideId).classList.remove('active');
        document.getElementById(showId).classList.add('active');
    }

    processPayment() {
        // Simulate payment processing
        const btn = document.querySelector('.pay-btn');
        btn.textContent = 'Processing...';
        btn.disabled = true;
        
        setTimeout(() => {
            // SUCCESS - Redirect to main.html
            document.getElementById('success').classList.add('active');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 2000);
        }, 2000);
    }

    formatCardNumber() {
        const cardInput = document.getElementById('card-number');
        cardInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let matches = value.match(/\d{4,16}/g);
            let match = matches && matches[0] || '';
            let parts = [];
            
            for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4));
            }
            
            if (parts.length) {
                e.target.value = parts.join(' ');
            } else {
                e.target.value = value;
            }
        });
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => new GymSubscription());
