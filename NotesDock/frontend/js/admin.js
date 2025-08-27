
 function logoutAdmin() {
      localStorage.removeItem("isAdminLoggedIn");
      window.location.href = "subject-page.html";
  }
   
// Tab switching functionality
        function showAdminSection(sectionName) {
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected section and activate tab
            document.getElementById(sectionName + '-section').classList.add('active');
            event.target.classList.add('active');
        }

        // Toggle new subject input
        function toggleNewSubject() {
            const select = document.getElementById('subjectSelect');
            const newSubjectGroup = document.getElementById('newSubjectGroup');
            
            if (select.value === 'new') {
                newSubjectGroup.style.display = 'block';
                document.getElementById('newSubjectName').required = true;
            } else {
                newSubjectGroup.style.display = 'none';
                document.getElementById('newSubjectName').required = false;
                document.getElementById('newSubjectName').value = '';
            }
        }

        // Auto-calculate topics count
        document.getElementById('unitTopics').addEventListener('input', function() {
            const topics = this.value.split(',').filter(topic => topic.trim() !== '');
            document.getElementById('topicsCount').value = topics.length;
        });

        // Handle file selection and drag & drop
        function handleFileSelect(input) {
            const fileInfo = document.getElementById('fileInfo');
            const fileInfoText = document.getElementById('fileInfoText');
            
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                
                fileInfoText.innerHTML = `
                    <i class="fas fa-file-check"></i> 
                    <strong>${file.name}</strong> (${fileSize} MB)
                `;
                fileInfo.style.display = 'block';
                
                // Update upload area appearance
                const uploadArea = document.getElementById('fileUploadArea');
                uploadArea.style.borderColor = '#27ae60';
                uploadArea.style.background = 'rgba(39, 174, 96, 0.05)';
            } else {
                fileInfo.style.display = 'none';
                resetFileUploadArea();
            }
        }

        function resetFileUploadArea() {
            const uploadArea = document.getElementById('fileUploadArea');
            uploadArea.style.borderColor = '#bdc3c7';
            uploadArea.style.background = '#f8f9fa';
        }

        // Drag and drop functionality
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            fileUploadArea.classList.add('dragover');
        }

        function unhighlight(e) {
            fileUploadArea.classList.remove('dragover');
        }

        fileUploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            document.getElementById('notesFile').files = files;
            handleFileSelect(document.getElementById('notesFile'));
        }

        // Form submission
        document.getElementById('uploadForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            
            const subjectSelect = document.getElementById('subjectSelect').value;
            const newSubjectName = document.getElementById('newSubjectName').value;
            const subject = subjectSelect === 'new' ? newSubjectName.toLowerCase().replace(/\s+/g, '') : subjectSelect;
            
            if (!subject) {
                showError('Please select or enter a subject name');
                resetSubmitButton();
                return;
            }

            // Collect form data
            const unitData = {
                subject: subject,
                subjectDisplay: subjectSelect === 'new' ? newSubjectName : subjectSelect.charAt(0).toUpperCase() + subjectSelect.slice(1),
                unitNumber: document.getElementById('unitNumber').value,
                unitIcon: document.getElementById('unitIcon').value || 'fas fa-book',
                unitTitle: document.getElementById('unitTitle').value,
                unitDescription: document.getElementById('unitDescription').value,
                unitTopics: document.getElementById('unitTopics').value,
                topicsCount: document.getElementById('topicsCount').value,
                pagesCount: document.getElementById('pagesCount').value,
                file: document.getElementById('notesFile').files[0]
            };

            // Validate required fields
            if (!unitData.unitTitle || !unitData.unitDescription || !unitData.unitTopics || !unitData.pagesCount) {
                showError('Please fill in all required fields');
                resetSubmitButton();
                return;
            }

            // Simulate processing delay
            setTimeout(() => {
                saveUnitData(unitData);
                resetSubmitButton();
            }, 1500);
        });

        function resetSubmitButton() {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Create Unit';
        }

        function saveUnitData(unitData) {
            try {
                // Get existing data
                let existingData = JSON.parse(localStorage.getItem('notesData') || '{}');
                
                // Initialize subject if it doesn't exist
                if (!existingData[unitData.subject]) {
                    existingData[unitData.subject] = {
                        displayName: unitData.subjectDisplay,
                        units: []
                    };
                }

                // Add unit data
                const unit = {
                    id: Date.now(),
                    number: unitData.unitNumber || existingData[unitData.subject].units.length + 1,
                    icon: unitData.unitIcon,
                    title: unitData.unitTitle,
                    description: unitData.unitDescription,
                    topics: unitData.unitTopics,
                    topicsCount: unitData.topicsCount,
                    pagesCount: unitData.pagesCount,
                    fileName: unitData.file ? unitData.file.name : null,
                    fileSize: unitData.file ? unitData.file.size : null,
                    createdAt: new Date().toISOString()
                };

                existingData[unitData.subject].units.push(unit);
                
                // Save back to localStorage
                localStorage.setItem('notesData', JSON.stringify(existingData));
                
                // Update stats
                updateStats();
                
                showSuccess(`Unit "${unitData.unitTitle}" created successfully! It will appear on the student page.`);
                resetForm();
                
            } catch (error) {
                showError('Error saving data: ' + error.message);
            }
        }

        function updateStats() {
            let stats = JSON.parse(localStorage.getItem('platformStats') || '{}');
            
            if (!stats.unitsCreated) stats.unitsCreated = 0;
            if (!stats.totalUploads) stats.totalUploads = 0;
            
            stats.unitsCreated++;
            stats.totalUploads++;
            stats.lastUpdate = new Date().toISOString();
            
            localStorage.setItem('platformStats', JSON.stringify(stats));
        }

        function showSuccess(message) {
            const successMsg = document.getElementById('successMessage');
            successMsg.textContent = message;
            successMsg.style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        }

        function showError(message) {
            const errorMsg = document.getElementById('errorMessage');
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
        }

        function resetForm() {
            document.getElementById('uploadForm').reset();
            document.getElementById('fileInfo').style.display = 'none';
            document.getElementById('newSubjectGroup').style.display = 'none';
            document.getElementById('topicsCount').value = '';
            resetFileUploadArea();
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Set default icon if not provided
            document.getElementById('unitIcon').placeholder = 'Default: fas fa-book';
        });


        // Manage Section Functions
function refreshManageData() {
    loadManageData();
    updateSubjectFilter();
    
    // Add refresh animation
    const refreshBtn = document.querySelector('.refresh-btn i');
    refreshBtn.style.animation = 'spin 1s linear';
    setTimeout(() => {
        refreshBtn.style.animation = '';
    }, 1000);
}

function loadManageData() {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const container = document.getElementById('manageDataContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    
    // Clear existing content
    container.innerHTML = '';
    
    if (Object.keys(notesData).length === 0) {
        noDataMessage.style.display = 'block';
        container.style.display = 'none';
        return;
    }
    
    noDataMessage.style.display = 'none';
    container.style.display = 'block';
    
    // Create subject cards
    Object.keys(notesData).forEach(subjectKey => {
        const subject = notesData[subjectKey];
        const subjectCard = createSubjectCard(subjectKey, subject);
        container.appendChild(subjectCard);
    });
}

function updateSubjectFilter() {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const filter = document.getElementById('subjectFilter');
    const currentValue = filter.value;
    
    // Clear existing options except "All Subjects"
    filter.innerHTML = '<option value="">All Subjects</option>';
    
    // Add subjects from localStorage
    Object.keys(notesData).forEach(subjectKey => {
        const option = document.createElement('option');
        option.value = subjectKey;
        option.textContent = notesData[subjectKey].displayName;
        filter.appendChild(option);
    });
    
    // Restore previous selection if still valid
    filter.value = currentValue;
}

function createSubjectCard(subjectKey, subject) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('data-subject', subjectKey);
    
    card.innerHTML = `
        <div class="subject-header" onclick="toggleSubject('${subjectKey}')">
            <div class="subject-info">
                <h3 class="subject-name">${subject.displayName}</h3>
                <div class="subject-stats">${subject.units.length} units</div>
            </div>
            <div class="subject-actions">
                <button class="action-btn" onclick="event.stopPropagation(); deleteSubject('${subjectKey}')" title="Delete Subject">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="expand-icon">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
        </div>
        <div class="units-container">
            ${subject.units.map(unit => createUnitHTML(subjectKey, unit)).join('')}
        </div>
    `;
    
    return card;
}

function createUnitHTML(subjectKey, unit) {
    const createdDate = new Date(unit.createdAt).toLocaleDateString();
    const fileSize = unit.fileSize ? (unit.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'No file';
    
    return `
        <div class="unit-item" data-unit-id="${unit.id}">
            <div class="unit-header-row">
                <div class="unit-main-info">
                    <div class="unit-title-row">
                        <div class="unit-icon">
                            <i class="${unit.icon}"></i>
                        </div>
                        <div class="unit-number">Unit ${unit.number}</div>
                        <h4 class="unit-title">${unit.title}</h4>
                    </div>
                    <p class="unit-description">${unit.description}</p>
                    <div class="unit-meta">
                        <div class="unit-meta-item">
                            <i class="fas fa-list"></i>
                            ${unit.topicsCount} topics
                        </div>
                        <div class="unit-meta-item">
                            <i class="fas fa-file-alt"></i>
                            ${unit.pagesCount} pages
                        </div>
                        <div class="unit-meta-item">
                            <i class="fas fa-calendar"></i>
                            Created ${createdDate}
                        </div>
                        <div class="unit-meta-item">
                            <i class="fas fa-hdd"></i>
                            ${fileSize}
                        </div>
                    </div>
                    <div class="unit-topics">
                        <div class="unit-topics-title">Topics:</div>
                        <div class="unit-topics-list">${unit.topics}</div>
                    </div>
                </div>
                <div class="unit-actions">
                    <button class="unit-action-btn edit" onclick="editUnit('${subjectKey}', ${unit.id})" title="Edit Unit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="unit-action-btn replace" onclick="replaceFile('${subjectKey}', ${unit.id})" title="Replace File">
                        <i class="fas fa-file-upload"></i>
                    </button>
                    <button class="unit-action-btn delete" onclick="deleteUnit('${subjectKey}', ${unit.id})" title="Delete Unit">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleSubject(subjectKey) {
    const card = document.querySelector(`[data-subject="${subjectKey}"]`);
    card.classList.toggle('expanded');
}

function filterContent() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const subjectFilter = document.getElementById('subjectFilter').value;
    const subjectCards = document.querySelectorAll('.subject-card');
    
    subjectCards.forEach(card => {
        const subjectKey = card.getAttribute('data-subject');
        const subjectName = card.querySelector('.subject-name').textContent.toLowerCase();
        const unitItems = card.querySelectorAll('.unit-item');
        
        let subjectMatch = !subjectFilter || subjectKey === subjectFilter;
        let searchMatch = !searchTerm || subjectName.includes(searchTerm);
        
        // Check units for search match
        let hasVisibleUnits = false;
        unitItems.forEach(unit => {
            const unitTitle = unit.querySelector('.unit-title').textContent.toLowerCase();
            const unitDescription = unit.querySelector('.unit-description').textContent.toLowerCase();
            const unitTopics = unit.querySelector('.unit-topics-list').textContent.toLowerCase();
            
            const unitSearchMatch = !searchTerm || 
                unitTitle.includes(searchTerm) || 
                unitDescription.includes(searchTerm) || 
                unitTopics.includes(searchTerm);
            
            if (subjectMatch && unitSearchMatch) {
                unit.style.display = 'block';
                hasVisibleUnits = true;
                searchMatch = true;
            } else {
                unit.style.display = 'none';
            }
        });
        
        if (subjectMatch && searchMatch && hasVisibleUnits) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Edit Unit Functions
function editUnit(subjectKey, unitId) {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const unit = notesData[subjectKey].units.find(u => u.id == unitId);
    
    if (!unit) return;
    
    // Populate edit form
    document.getElementById('editUnitId').value = unitId;
    document.getElementById('editSubjectKey').value = subjectKey;
    document.getElementById('editUnitNumber').value = unit.number;
    document.getElementById('editUnitIcon').value = unit.icon;
    document.getElementById('editUnitTitle').value = unit.title;
    document.getElementById('editUnitDescription').value = unit.description;
    document.getElementById('editUnitTopics').value = unit.topics;
    document.getElementById('editTopicsCount').value = unit.topicsCount;
    document.getElementById('editPagesCount').value = unit.pagesCount;
    
    // Show modal
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function saveUnitEdit() {
    const unitId = parseInt(document.getElementById('editUnitId').value);
    const subjectKey = document.getElementById('editSubjectKey').value;
    
    const updatedUnit = {
        number: document.getElementById('editUnitNumber').value,
        icon: document.getElementById('editUnitIcon').value,
        title: document.getElementById('editUnitTitle').value,
        description: document.getElementById('editUnitDescription').value,
        topics: document.getElementById('editUnitTopics').value,
        topicsCount: document.getElementById('editTopicsCount').value,
        pagesCount: document.getElementById('editPagesCount').value
    };
    
    // Validate required fields
    if (!updatedUnit.title || !updatedUnit.description || !updatedUnit.topics || !updatedUnit.pagesCount) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update localStorage
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const unitIndex = notesData[subjectKey].units.findIndex(u => u.id == unitId);
    
    if (unitIndex !== -1) {
        // Keep existing data and update only modified fields
        Object.assign(notesData[subjectKey].units[unitIndex], updatedUnit);
        notesData[subjectKey].units[unitIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('notesData', JSON.stringify(notesData));
        
        // Refresh the display
        loadManageData();
        closeEditModal();
        
        alert('Unit updated successfully!');
    }
}

// Auto-calculate topics count in edit form
document.getElementById('editUnitTopics').addEventListener('input', function() {
    const topics = this.value.split(',').filter(topic => topic.trim() !== '');
    document.getElementById('editTopicsCount').value = topics.length;
});

// File Replace Functions
function replaceFile(subjectKey, unitId) {
    document.getElementById('replaceUnitId').value = unitId;
    document.getElementById('replaceSubjectKey').value = subjectKey;
    
    // Reset file input and info
    document.getElementById('replaceFile').value = '';
    document.getElementById('replaceFileInfo').style.display = 'none';
    resetReplaceFileUploadArea();
    
    // Show modal
    document.getElementById('replaceFileModal').classList.add('active');
}

function closeReplaceFileModal() {
    document.getElementById('replaceFileModal').classList.remove('active');
}

function handleReplaceFileSelect(input) {
    const fileInfo = document.getElementById('replaceFileInfo');
    const fileInfoText = document.getElementById('replaceFileInfoText');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        fileInfoText.innerHTML = `
            <i class="fas fa-file-check"></i> 
            <strong>${file.name}</strong> (${fileSize} MB)
        `;
        fileInfo.style.display = 'block';
        
        // Update upload area appearance
        const uploadArea = document.getElementById('replaceFileUploadArea');
        uploadArea.style.borderColor = '#27ae60';
        uploadArea.style.background = 'rgba(39, 174, 96, 0.05)';
    } else {
        fileInfo.style.display = 'none';
        resetReplaceFileUploadArea();
    }
}

function resetReplaceFileUploadArea() {
    const uploadArea = document.getElementById('replaceFileUploadArea');
    uploadArea.style.borderColor = '#bdc3c7';
    uploadArea.style.background = '#f8f9fa';
}

function saveFileReplace() {
    const unitId = parseInt(document.getElementById('replaceUnitId').value);
    const subjectKey = document.getElementById('replaceSubjectKey').value;
    const fileInput = document.getElementById('replaceFile');
    
    if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select a file to upload');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Update localStorage
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const unitIndex = notesData[subjectKey].units.findIndex(u => u.id == unitId);
    
    if (unitIndex !== -1) {
        notesData[subjectKey].units[unitIndex].fileName = file.name;
        notesData[subjectKey].units[unitIndex].fileSize = file.size;
        notesData[subjectKey].units[unitIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('notesData', JSON.stringify(notesData));
        
        // Refresh the display
        loadManageData();
        closeReplaceFileModal();
        
        alert('File replaced successfully!');
    }
}

// Delete Functions
function deleteUnit(subjectKey, unitId) {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const unit = notesData[subjectKey].units.find(u => u.id == unitId);
    
    if (!unit) return;
    
    if (confirm(`Are you sure you want to delete the unit "${unit.title}"? This action cannot be undone.`)) {
        // Remove unit from array
        notesData[subjectKey].units = notesData[subjectKey].units.filter(u => u.id != unitId);
        
        // If no units left, optionally remove subject
        if (notesData[subjectKey].units.length === 0) {
            if (confirm(`Subject "${notesData[subjectKey].displayName}" now has no units. Do you want to delete the entire subject?`)) {
                delete notesData[subjectKey];
            }
        }
        
        localStorage.setItem('notesData', JSON.stringify(notesData));
        
        // Update stats
        updateDeleteStats();
        
        // Refresh display
        loadManageData();
        updateSubjectFilter();
        
        alert('Unit deleted successfully!');
    }
}

function deleteSubject(subjectKey) {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const subject = notesData[subjectKey];
    
    if (!subject) return;
    
    if (confirm(`Are you sure you want to delete the entire subject "${subject.displayName}" and all its ${subject.units.length} units? This action cannot be undone.`)) {
        delete notesData[subjectKey];
        localStorage.setItem('notesData', JSON.stringify(notesData));
        
        // Update stats
        updateDeleteStats(subject.units.length);
        
        // Refresh display
        loadManageData();
        updateSubjectFilter();
        
        alert('Subject deleted successfully!');
    }
}

function updateDeleteStats(unitsDeleted = 1) {
    let stats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    
    if (!stats.unitsDeleted) stats.unitsDeleted = 0;
    stats.unitsDeleted += unitsDeleted;
    stats.lastUpdate = new Date().toISOString();
    
    localStorage.setItem('platformStats', JSON.stringify(stats));
}

// Bulk Operations
function selectAllUnits() {
    const checkboxes = document.querySelectorAll('.unit-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const selectedUnits = document.querySelectorAll('.unit-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    
    if (selectedUnits.length > 0) {
        bulkActions.style.display = 'block';
        document.getElementById('selectedCount').textContent = selectedUnits.length;
    } else {
        bulkActions.style.display = 'none';
    }
}

function bulkDelete() {
    const selectedUnits = document.querySelectorAll('.unit-checkbox:checked');
    
    if (selectedUnits.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedUnits.length} selected units? This action cannot be undone.`)) {
        const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
        
        selectedUnits.forEach(checkbox => {
            const unitItem = checkbox.closest('.unit-item');
            const unitId = parseInt(unitItem.getAttribute('data-unit-id'));
            const subjectCard = checkbox.closest('.subject-card');
            const subjectKey = subjectCard.getAttribute('data-subject');
            
            // Remove unit from data
            notesData[subjectKey].units = notesData[subjectKey].units.filter(u => u.id !== unitId);
            
            // Remove empty subjects
            if (notesData[subjectKey].units.length === 0) {
                delete notesData[subjectKey];
            }
        });
        
        localStorage.setItem('notesData', JSON.stringify(notesData));
        
        // Update stats
        updateDeleteStats(selectedUnits.length);
        
        // Refresh display
        loadManageData();
        updateSubjectFilter();
        
        alert(`${selectedUnits.length} units deleted successfully!`);
    }
}

// Export/Import Functions
function exportData() {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    
    const exportData = {
        notesData,
        platformStats,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `notes-dock-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.notesData) {
                    alert('Invalid backup file format');
                    return;
                }
                
                if (confirm('This will replace all existing data. Are you sure you want to continue?')) {
                    localStorage.setItem('notesData', JSON.stringify(importData.notesData));
                    
                    if (importData.platformStats) {
                        localStorage.setItem('platformStats', JSON.stringify(importData.platformStats));
                    }
                    
                    // Refresh display
                    loadManageData();
                    updateSubjectFilter();
                    
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error reading backup file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Search and Sort Functions
function sortUnits(sortBy) {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    
    Object.keys(notesData).forEach(subjectKey => {
        notesData[subjectKey].units.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'number':
                    return parseInt(a.number) - parseInt(b.number);
                case 'created':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'updated':
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                case 'pages':
                    return parseInt(b.pagesCount) - parseInt(a.pagesCount);
                default:
                    return 0;
            }
        });
    });
    
    localStorage.setItem('notesData', JSON.stringify(notesData));
    loadManageData();
}

// Initialize manage section when tab is switched
function initializeManageSection() {
    // Load data on first access
    loadManageData();
    updateSubjectFilter();
    
    // Set up drag and drop for replace file modal
    setupReplaceFileDragDrop();
}

function setupReplaceFileDragDrop() {
    const replaceFileUploadArea = document.getElementById('replaceFileUploadArea');
    
    if (!replaceFileUploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        replaceFileUploadArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        replaceFileUploadArea.addEventListener(eventName, highlightReplace, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        replaceFileUploadArea.addEventListener(eventName, unhighlightReplace, false);
    });

    replaceFileUploadArea.addEventListener('drop', handleReplaceDrop, false);
}

function highlightReplace(e) {
    document.getElementById('replaceFileUploadArea').classList.add('dragover');
}

function unhighlightReplace(e) {
    document.getElementById('replaceFileUploadArea').classList.remove('dragover');
}

function handleReplaceDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    document.getElementById('replaceFile').files = files;
    handleReplaceFileSelect(document.getElementById('replaceFile'));
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on manage section and initialize
    if (typeof showAdminSection === 'function') {
        // Override the original showAdminSection to initialize manage section
        const originalShowAdminSection = window.showAdminSection;
        window.showAdminSection = function(sectionName) {
            originalShowAdminSection(sectionName);
            if (sectionName === 'manage') {
                setTimeout(() => initializeManageSection(), 100);
            }
        };
    }
});


// Overview Section Functions

// Initialize overview when tab is loaded
function initializeOverview() {
    refreshOverviewStats();
    loadRecentActivity();
    updateLastUpdated();
}

// Refresh all statistics
function refreshOverviewStats() {
    calculateAndDisplayStats();
    loadRecentActivity();
    updateLastUpdated();
    
    // Add refresh animation
    const refreshBtn = document.querySelector('.refresh-activity-btn i');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 1s linear';
        setTimeout(() => {
            refreshBtn.style.animation = '';
        }, 1000);
    }
}

// Calculate and display all statistics
function calculateAndDisplayStats() {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    
    // Calculate totals from actual data
    const totalSubjects = Object.keys(notesData).length;
    let totalUnits = 0;
    let totalFiles = 0;
    let totalStorage = 0;
    
    Object.values(notesData).forEach(subject => {
        totalUnits += subject.units.length;
        subject.units.forEach(unit => {
            if (unit.fileName) {
                totalFiles++;
                totalStorage += unit.fileSize || 0;
            }
        });
    });
    
    // Get visitor and download counts from stats
    const visitorCount = platformStats.visitorCount || 0;
    const downloadCount = platformStats.downloadCount || 0;
    
    // Update DOM elements
    updateStatElement('totalSubjects', totalSubjects);
    updateStatElement('totalUnits', totalUnits);
    updateStatElement('totalFiles', totalFiles);
    updateStatElement('visitorCount', visitorCount);
    updateStatElement('downloadCount', downloadCount);
    updateStatElement('totalStorage', formatFileSize(totalStorage));
}

// Update individual stat element with animation
function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const targetValue = typeof value === 'number' ? value : parseInt(value) || 0;
    
    if (currentValue !== targetValue && typeof value === 'number') {
        // Animate number change
        animateNumber(element, currentValue, targetValue, 1000);
    } else {
        element.textContent = value;
    }
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const minTimer = 50;
    const stepTime = Math.abs(Math.floor(duration / range));
    const timer = stepTime < minTimer ? minTimer : stepTime;
    const startTime = new Date().getTime();
    const endTime = startTime + duration;
    
    function run() {
        const now = new Date().getTime();
        const remaining = Math.max((endTime - now) / duration, 0);
        const current = Math.round(end - (remaining * range));
        element.textContent = current;
        
        if (current !== end) {
            setTimeout(run, timer);
        }
    }
    
    run();
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 MB';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Load and display recent activity
function loadRecentActivity() {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    const activityContainer = document.getElementById('activityContent');
    
    if (!activityContainer) return;
    
    const activities = [];
    
    // Add recent unit creations
    Object.values(notesData).forEach(subject => {
        subject.units.forEach(unit => {
            activities.push({
                type: 'unit_created',
                text: `New unit "${unit.title}" created in ${subject.displayName}`,
                time: unit.createdAt,
                icon: 'fas fa-plus-circle',
                color: '#27ae60'
            });
            
            if (unit.updatedAt && unit.updatedAt !== unit.createdAt) {
                activities.push({
                    type: 'unit_updated',
                    text: `Unit "${unit.title}" was updated`,
                    time: unit.updatedAt,
                    icon: 'fas fa-edit',
                    color: '#3498db'
                });
            }
        });
    });
    
    // Add system events
    if (platformStats.lastUpdate) {
        activities.push({
            type: 'stats_update',
            text: 'Platform statistics updated',
            time: platformStats.lastUpdate,
            icon: 'fas fa-chart-line',
            color: '#9b59b6'
        });
    }
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Take only the last 10 activities
    const recentActivities = activities.slice(0, 10);
    
    if (recentActivities.length === 0) {
        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-text">No recent activity</div>
                <div class="activity-time">-</div>
            </div>
        `;
        return;
    }
    
    // Render activities
    activityContainer.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.color}20; color: ${activity.color};">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-text">${activity.text}</div>
            <div class="activity-time">${formatTimeAgo(activity.time)}</div>
        </div>
    `).join('');
}

// Format time ago
function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

// Update last updated time
function updateLastUpdated() {
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    if (!lastUpdatedElement) return;
    
    if (platformStats.lastUpdate) {
        const lastUpdate = new Date(platformStats.lastUpdate);
        lastUpdatedElement.textContent = lastUpdate.toLocaleString();
    } else {
        lastUpdatedElement.textContent = 'Never';
    }
}

// Increment visitor count (call this from student page)
function incrementVisitorCount() {
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    platformStats.visitorCount = (platformStats.visitorCount || 0) + 1;
    platformStats.lastUpdate = new Date().toISOString();
    localStorage.setItem('platformStats', JSON.stringify(platformStats));
}

// Increment download count (call this when download button is clicked)
function incrementDownloadCount() {
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    platformStats.downloadCount = (platformStats.downloadCount || 0) + 1;
    platformStats.lastUpdate = new Date().toISOString();
    localStorage.setItem('platformStats', JSON.stringify(platformStats));
}

// Export platform data
function exportPlatformData() {
    const notesData = JSON.parse(localStorage.getItem('notesData') || '{}');
    const platformStats = JSON.parse(localStorage.getItem('platformStats') || '{}');
    
    const exportData = {
        notesData,
        platformStats,
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalSubjects: Object.keys(notesData).length,
        totalUnits: Object.values(notesData).reduce((total, subject) => total + subject.units.length, 0)
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `notes-dock-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Platform data exported successfully!');
}

// Reset all statistics
function resetAllStats() {
    if (confirm('Are you sure you want to reset all statistics? This will not affect your subjects and units, only the visitor counts and download counts.')) {
        const platformStats = {
            visitorCount: 0,
            downloadCount: 0,
            unitsCreated: 0,
            totalUploads: 0,
            unitsDeleted: 0,
            lastUpdate: new Date().toISOString()
        };
        
        localStorage.setItem('platformStats', JSON.stringify(platformStats));
        
        // Refresh the display
        refreshOverviewStats();
        
        alert('Statistics reset successfully!');
    }
}
