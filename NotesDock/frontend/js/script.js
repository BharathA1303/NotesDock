 // Subject data with enhanced information
        const subjectData = {
            tamil: {
                title: 'Tamil Language & Literature',
                subtitle: 'Comprehensive Tamil language notes and literature guides',
                totalFiles: 15,
                totalPages: 200
            },
            english: {
                title: 'English Language & Communication',
                subtitle: 'English grammar, literature, and communication skills',
                totalFiles: 20,
                totalPages: 246
            },
            statistics: {
                title: 'Statistics & Data Analysis',
                subtitle: 'Statistical methods, probability, and data analysis techniques',
                totalFiles: 12,
                totalPages: 313
            },
            java: {
                title: 'Java Programming',
                subtitle: 'Java programming concepts and practical implementation',
                totalFiles: 18,
                totalPages: 378
            },
            html: {
                 title: 'Web Technology & Development',
                  subtitle: 'HTML, CSS, JavaScript, DOM manipulation, and AngularJS framework',
                 totalFiles: 15,
                totalPages: 335
    }
        };

        


        // Initialize the page
        document.addEventListener('DOMContentLoaded', function () {
            // Get subject from URL parameter or default to Tamil
            const urlParams = new URLSearchParams(window.location.search);
            const subject = urlParams.get('subject') || 'tamil';

            if (subject && subjectData[subject]) {
                showSubject(subject);
            } else {
                showSubject('tamil');
            }

            // Add smooth scrolling and animations
            initializeAnimations();
        });

        function showSubject(subjectName) {
            // Hide all sections
            document.querySelectorAll('.subject-section').forEach(section => {
                section.classList.remove('active');
            });

            // Remove active class from all tabs
            document.querySelectorAll('.subject-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected section
            const section = document.getElementById(`${subjectName}-section`);
            if (section) {
                section.classList.add('active');
            }

            // Add active class to selected tab
            const tabs = document.querySelectorAll('.subject-tab');
            tabs.forEach((tab, index) => {
                if (tab.textContent.toLowerCase() === subjectName) {
                    tab.classList.add('active');
                }
            });

            // Update header information
            const data = subjectData[subjectName];
            if (data) {
                document.getElementById('subject-title').textContent = data.title;
                document.getElementById('subject-subtitle').textContent = data.subtitle;
                document.getElementById('current-subject').textContent = data.title;
            }

            // Trigger card animations
            setTimeout(() => {
                const cards = section.querySelectorAll('.unit-card');
                cards.forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.style.animation = 'none';
                    card.offsetHeight; // Trigger reflow
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                });
            }, 100);

            // Update URL without page reload
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('subject', subjectName);
            window.history.pushState({}, '', newUrl);

            // Track analytics
            trackEvent('view', 'subject-units', subjectName);
        }

        function downloadUnit(subject, unitNumber) {
            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<div class="loading"></div> Downloading...';
            button.disabled = true;

            // Simulate download process
            setTimeout(() => {
                // In a real application, this would trigger an actual download
                showToast(`Downloaded ${subject.charAt(0).toUpperCase() + subject.slice(1)} Unit ${unitNumber} successfully!`, 'success');

                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;

                // Track download
                trackEvent('download', 'unit', `${subject}-unit-${unitNumber}`);
            }, 2000);
        }

        function initializeAnimations() {
            // Intersection Observer for scroll animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe unit cards for animation
            document.querySelectorAll('.unit-card').forEach(card => {
                observer.observe(card);
            });
        }

        // Toast notification system
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: var(--shadow-lg);
                z-index: 5000;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
            `;

            document.body.appendChild(toast);

            // Animate in
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            }, 100);

            // Remove after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }

        // Analytics tracking
        function trackEvent(action, category, label) {
            console.log(`Analytics: ${category} - ${action} - ${label}`);
            // In a real app, you would send this to your analytics service
        }

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            // Navigate between subjects with arrow keys
            if (e.altKey) {
                const subjects = ['tamil', 'english', 'statistics', 'java', 'html'];
                const activeTab = document.querySelector('.subject-tab.active');
                const currentIndex = Array.from(document.querySelectorAll('.subject-tab')).indexOf(activeTab);

                if (e.key === 'ArrowRight' && currentIndex < subjects.length - 1) {
                    e.preventDefault();
                    showSubject(subjects[currentIndex + 1]);
                } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    showSubject(subjects[currentIndex - 1]);
                }
            }

            // Back to home with Escape
            if (e.key === 'Escape') {
                window.location.href = 'notes-2nd.html';
            }
        });

        // Search functionality
        function searchUnits(searchTerm) {
            const activeSection = document.querySelector('.subject-section.active');
            const unitCards = activeSection.querySelectorAll('.unit-card');

            unitCards.forEach(card => {
                const title = card.querySelector('.unit-title').textContent.toLowerCase();
                const description = card.querySelector('.unit-description').textContent.toLowerCase();
                const topics = card.querySelector('.unit-topics').textContent.toLowerCase();

                const isVisible = title.includes(searchTerm.toLowerCase()) ||
                    description.includes(searchTerm.toLowerCase()) ||
                    topics.includes(searchTerm.toLowerCase());

                card.style.display = isVisible ? 'block' : 'none';
            });
        }

        // Performance optimization
        function lazyLoadContent() {
            // Implement lazy loading for heavy content
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Initialize performance optimizations
        document.addEventListener('DOMContentLoaded', lazyLoadContent);

        // Print functionality
        function printUnits() {
            window.print();
        }

        // Add keyboard shortcuts info
        function showKeyboardShortcuts() {
            const shortcuts = `
                Keyboard Shortcuts:
                • Alt + Left/Right: Navigate between subjects
                • Escape: Back to home
                • Tab: Navigate between elements
                • Enter: Download/Select units
                • Ctrl + P: Print page
            `;
            alert(shortcuts);
        }

        // Help shortcut
        document.addEventListener('keydown', function (e) {
            if (e.key === 'F1') {
                e.preventDefault();
                showKeyboardShortcuts();
            }
        });

        console.log('📚 Notes Dock Units Page - Loaded successfully!');
        console.log('💡 Tip: Use Alt + Arrow keys to navigate between subjects');
        console.log('💡 Tip: Press F1 to see all keyboard shortcuts');