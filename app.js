// Application Data
const appData = {
  elections: [
    {
      id: 1,
      title: "Student Council Election 2025",
      description: "Choose your student representatives",
      date: "2025-10-15",
      status: "upcoming",
      participants: 1247
    },
    {
      id: 2,
      title: "Budget Allocation Referendum",
      description: "Vote on university budget priorities",
      date: "2025-11-20",
      status: "upcoming",
      participants: 892
    },
    {
      id: 3,
      title: "Campus Sustainability Initiative",
      description: "Support green campus initiatives",
      date: "2025-12-05",
      status: "upcoming",
      participants: 445
    }
  ],
  ballots: {
    "1": {
      title: "Student Council Election 2025",
      questions: [
        {
          id: "president",
          type: "single",
          question: "Select Student Council President",
          options: [
            {id: "p1", name: "Sarah Johnson", party: "Progressive Unity"},
            {id: "p2", name: "Michael Chen", party: "Student First"},
            {id: "p3", name: "Emily Rodriguez", party: "Campus Connect"}
          ]
        },
        {
          id: "vicepresident",
          type: "single",
          question: "Select Vice President",
          options: [
            {id: "vp1", name: "David Kim", party: "Progressive Unity"},
            {id: "vp2", name: "Lisa Thompson", party: "Student First"},
            {id: "vp3", name: "Carlos Martinez", party: "Campus Connect"}
          ]
        }
      ]
    }
  },
  userStats: {
    totalUsers: 15420,
    activeElections: 3,
    completedVotes: 12847
  },
  trustIndicators: [
    "256-bit SSL Encryption",
    "Verified by Election Commission",
    "99.9% Uptime Guarantee",
    "Blockchain Verified Results"
  ]
};

// Application State
let currentUser = null;
let currentElection = null;
let currentQuestionIndex = 0;
let ballotSelections = {};
let carouselIndex = 0;
let currentTheme = 'light';

// Theme Management
function initializeTheme() {
  // Check for saved theme preference or default to system preference
  const savedTheme = getSavedTheme();
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);
  
  console.log('Theme initialized:', currentTheme);
}

function getSavedTheme() {
  try {
    return sessionStorage.getItem('theme');
  } catch (error) {
    console.warn('Could not access sessionStorage for theme');
    return null;
  }
}

function saveTheme(theme) {
  try {
    sessionStorage.setItem('theme', theme);
    console.log('Theme saved:', theme);
  } catch (error) {
    console.warn('Could not save theme to sessionStorage');
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  saveTheme(theme);
  
  console.log('Theme applied:', theme);
}

function toggleTheme() {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  console.log('Toggling theme from', currentTheme, 'to', newTheme);
  applyTheme(newTheme);
  
  // Redraw charts if they exist
  const resultsChart = document.getElementById('resultsChart');
  if (resultsChart && currentElection) {
    drawResultsChart();
  }
}

// Listen for system theme changes
function setupThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e) => {
    if (!getSavedTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handleChange);
  } else {
    mediaQuery.addEventListener('change', handleChange);
  }
}

// Utility Functions
function showElement(element) {
  if (element) {
    element.classList.remove('hidden');
    element.style.display = '';
  }
}

function hideElement(element) {
  if (element) {
    element.classList.add('hidden');
  }
}

function showPage(pageId) {
  // Hide all page sections
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show the requested page
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    console.log('Navigated to:', pageId);
  }
}

function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  showElement(loadingOverlay);
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  hideElement(loadingOverlay);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatNumber(num) {
  return num.toLocaleString();
}

// Session Management
function saveSession(user) {
  try {
    currentUser = user;
    updateAuthUI();
    console.log('User session saved:', user);
  } catch (error) {
    console.error('Session save error:', error);
  }
}

function loadSession() {
  return currentUser;
}

function clearSession() {
  currentUser = null;
  updateAuthUI();
  console.log('User session cleared');
}

function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (currentUser) {
    hideElement(loginBtn);
    hideElement(registerBtn);
    showElement(logoutBtn);
    
    // Update user name in dashboard
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = currentUser.name || 'Voter';
    }
  } else {
    showElement(loginBtn);
    showElement(registerBtn);
    hideElement(logoutBtn);
  }
}

// Form Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength < 3) return 'weak';
  if (strength < 4) return 'medium';
  return 'strong';
}

function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearFieldError(fieldId) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

// Modal Management
function openModal(modalId) {
  console.log('Opening modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    
    // Focus the first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
    console.log('Modal opened successfully:', modalId);
  } else {
    console.error('Modal not found:', modalId);
  }
}

function closeModal(modalId) {
  console.log('Closing modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    
    // Clear form data
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
      // Clear error messages
      modal.querySelectorAll('.form-error').forEach(error => {
        error.textContent = '';
      });
    }
    console.log('Modal closed successfully:', modalId);
  }
}

// Authentication Functions
function handleLogin(email, password) {
  return new Promise((resolve, reject) => {
    console.log('Handling login for:', email);
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
      hideLoading();
      
      // Simple validation for demo
      if (validateEmail(email) && password.length > 0) {
        const user = {
          id: 1,
          name: email.split('@')[0],
          email: email,
          role: email.includes('admin') ? 'admin' : 'voter'
        };
        
        console.log('Login successful, requiring 2FA');
        resolve({ requiresTwoFactor: true, user });
      } else {
        console.log('Login failed: Invalid credentials');
        reject(new Error('Invalid credentials'));
      }
    }, 1500);
  });
}

function handleRegister(name, email, password) {
  return new Promise((resolve, reject) => {
    console.log('Handling registration for:', email);
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
      hideLoading();
      
      if (name && validateEmail(email) && validatePassword(password)) {
        const user = {
          id: Date.now(),
          name: name,
          email: email,
          role: 'voter'
        };
        
        console.log('Registration successful, requiring 2FA');
        resolve({ requiresTwoFactor: true, user });
      } else {
        console.log('Registration failed: Invalid data');
        reject(new Error('Invalid registration data'));
      }
    }, 1500);
  });
}

function handleTwoFactor(code, user) {
  return new Promise((resolve, reject) => {
    console.log('Handling 2FA verification');
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
      hideLoading();
      
      // Accept any 6-digit code for demo
      if (code.length === 6) {
        console.log('2FA verification successful');
        resolve(user);
      } else {
        console.log('2FA verification failed');
        reject(new Error('Invalid verification code'));
      }
    }, 1000);
  });
}

// Elections Functions
function loadElections() {
  console.log('Loading elections...');
  const carousel = document.getElementById('electionsCarousel');
  const availableElections = document.getElementById('availableElections');
  
  if (carousel) {
    carousel.innerHTML = appData.elections.map(election => `
      <div class="election-card" data-election-id="${election.id}">
        <h3 class="election-title">${election.title}</h3>
        <p class="election-description">${election.description}</p>
        <div class="election-meta">
          <span>${formatDate(election.date)}</span>
          <span>${formatNumber(election.participants)} participants</span>
        </div>
      </div>
    `).join('');
    console.log('Elections loaded to carousel');
  }
  
  if (availableElections) {
    availableElections.innerHTML = appData.elections.map(election => `
      <div class="election-item" data-election-id="${election.id}">
        <h4>${election.title}</h4>
        <p>${election.description}</p>
        <p>Date: ${formatDate(election.date)} | ${formatNumber(election.participants)} participants</p>
      </div>
    `).join('');
    console.log('Elections loaded to dashboard');
  }
}

function loadTrustIndicators() {
  const trustContainer = document.getElementById('trustIndicators');
  if (trustContainer) {
    trustContainer.innerHTML = appData.trustIndicators.map(indicator => `
      <div class="trust-badge">${indicator}</div>
    `).join('');
    console.log('Trust indicators loaded');
  }
}

function loadUserStats() {
  const stats = appData.userStats;
  
  const totalUsersEl = document.getElementById('totalUsers');
  const activeElectionsEl = document.getElementById('activeElections');
  const completedVotesEl = document.getElementById('completedVotes');
  
  if (totalUsersEl) totalUsersEl.textContent = formatNumber(stats.totalUsers);
  if (activeElectionsEl) activeElectionsEl.textContent = stats.activeElections;
  if (completedVotesEl) completedVotesEl.textContent = formatNumber(stats.completedVotes);
  
  console.log('User stats loaded');
}

// Carousel Functions
function updateCarousel() {
  const carousel = document.getElementById('electionsCarousel');
  if (carousel) {
    const cardWidth = 100 / 3; // Show 3 cards at a time
    const translateX = -carouselIndex * cardWidth;
    carousel.style.transform = `translateX(${translateX}%)`;
    console.log('Carousel updated, index:', carouselIndex);
  }
}

function nextCarouselSlide() {
  const maxIndex = Math.max(0, appData.elections.length - 3);
  carouselIndex = Math.min(carouselIndex + 1, maxIndex);
  updateCarousel();
}

function prevCarouselSlide() {
  carouselIndex = Math.max(carouselIndex - 1, 0);
  updateCarousel();
}

// Voting Functions
function startVoting(electionId) {
  console.log('Starting voting for election:', electionId);
  currentElection = appData.ballots[electionId];
  if (!currentElection) {
    alert('Election data not available');
    return;
  }
  
  currentQuestionIndex = 0;
  ballotSelections = {};
  
  document.getElementById('ballotTitle').textContent = currentElection.title;
  loadBallotQuestion();
  showPage('votingInterface');
}

function loadBallotQuestion() {
  const question = currentElection.questions[currentQuestionIndex];
  const ballotContent = document.getElementById('ballotContent');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  // Update progress
  const progress = ((currentQuestionIndex + 1) / currentElection.questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${currentElection.questions.length}`;
  
  // Load question content
  ballotContent.innerHTML = `
    <div class="ballot-question">
      <h2 class="question-title">${question.question}</h2>
      <div class="question-options">
        ${question.options.map(option => `
          <label class="option-item" for="option-${option.id}">
            <input type="radio" id="option-${option.id}" name="${question.id}" value="${option.id}">
            <div class="option-content">
              <div class="option-name">${option.name}</div>
              <div class="option-party">${option.party}</div>
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  
  // Restore previous selection
  const savedSelection = ballotSelections[question.id];
  if (savedSelection) {
    const savedInput = document.getElementById(`option-${savedSelection}`);
    if (savedInput) {
      savedInput.checked = true;
      savedInput.closest('.option-item').classList.add('selected');
    }
  }
  
  // Add event listeners for new content
  document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', handleOptionSelect);
  });
  
  // Update navigation buttons
  updateVotingNavigation();
  console.log('Ballot question loaded:', currentQuestionIndex + 1);
}

function handleOptionSelect(event) {
  const questionId = event.target.name;
  const optionId = event.target.value;
  
  // Save selection
  ballotSelections[questionId] = optionId;
  
  // Update UI
  document.querySelectorAll('.option-item').forEach(item => {
    item.classList.remove('selected');
  });
  event.target.closest('.option-item').classList.add('selected');
  
  console.log('Option selected:', questionId, optionId);
}

function updateVotingNavigation() {
  const prevBtn = document.getElementById('prevQuestion');
  const nextBtn = document.getElementById('nextQuestion');
  const reviewBtn = document.getElementById('reviewBallot');
  
  // Show/hide previous button
  if (currentQuestionIndex > 0) {
    showElement(prevBtn);
  } else {
    hideElement(prevBtn);
  }
  
  // Show next or review button
  if (currentQuestionIndex < currentElection.questions.length - 1) {
    showElement(nextBtn);
    hideElement(reviewBtn);
  } else {
    hideElement(nextBtn);
    showElement(reviewBtn);
  }
}

function nextQuestion() {
  if (currentQuestionIndex < currentElection.questions.length - 1) {
    currentQuestionIndex++;
    loadBallotQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadBallotQuestion();
  }
}

function showReviewScreen() {
  const reviewContent = document.getElementById('reviewContent');
  
  reviewContent.innerHTML = currentElection.questions.map(question => {
    const selection = ballotSelections[question.id];
    const selectedOption = question.options.find(opt => opt.id === selection);
    
    return `
      <div class="review-question">
        <h3>${question.question}</h3>
        <div class="review-selection">
          <strong>${selectedOption ? selectedOption.name : 'No selection'}</strong>
          ${selectedOption ? `<span> - ${selectedOption.party}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  showPage('reviewScreen');
  console.log('Review screen displayed');
}

function submitVote() {
  // Validate all questions are answered
  const unansweredQuestions = currentElection.questions.filter(q => !ballotSelections[q.id]);
  
  if (unansweredQuestions.length > 0) {
    alert(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
    return;
  }
  
  console.log('Submitting vote...');
  showLoading();
  
  // Simulate vote submission
  setTimeout(() => {
    hideLoading();
    showResults();
  }, 2000);
}

function showResults() {
  showPage('resultsPage');
  
  // Trigger success animation
  const animation = document.getElementById('successAnimation');
  animation.style.animation = 'none';
  setTimeout(() => {
    animation.style.animation = 'successPulse 2s ease-in-out';
  }, 100);
  
  // Draw results chart
  drawResultsChart();
  console.log('Results page displayed');
}

function drawResultsChart() {
  const canvas = document.getElementById('resultsChart');
  const ctx = canvas.getContext('2d');
  
  // Sample data for the first question
  const question = currentElection.questions[0];
  const data = [
    { label: question.options[0].name, value: 45, color: '#1FB8CD' },
    { label: question.options[1].name, value: 35, color: '#FFC185' },
    { label: question.options[2].name, value: 20, color: '#B4413C' }
  ];
  
  // Set canvas size
  canvas.width = 400;
  canvas.height = 200;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get current theme colors
  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1a365d';
  
  // Draw bar chart
  const barWidth = 80;
  const barSpacing = 40;
  const startX = 50;
  const maxBarHeight = 120;
  const maxValue = Math.max(...data.map(d => d.value));
  
  data.forEach((item, index) => {
    const x = startX + (barWidth + barSpacing) * index;
    const barHeight = (item.value / maxValue) * maxBarHeight;
    const y = canvas.height - 60 - barHeight;
    
    // Draw bar
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw label
    ctx.fillStyle = textColor;
    ctx.font = '12px Open Sans';
    ctx.textAlign = 'center';
    ctx.fillText(item.label.split(' ')[0], x + barWidth / 2, canvas.height - 40);
    
    // Draw value
    ctx.font = 'bold 14px Open Sans';
    ctx.fillText(`${item.value}%`, x + barWidth / 2, y - 10);
  });
  
  // Draw title
  ctx.font = 'bold 16px Poppins';
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  ctx.fillText('Election Results - ' + question.question, canvas.width / 2, 20);
  
  console.log('Results chart drawn');
}

// Two-Factor Authentication
function setupTwoFactorInputs() {
  const inputs = document.querySelectorAll('.verification-digit');
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      
      // Only allow digits
      if (!/^\d$/.test(value)) {
        e.target.value = '';
        return;
      }
      
      // Move to next input
      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    
    input.addEventListener('keydown', (e) => {
      // Move to previous input on backspace
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

function getTwoFactorCode() {
  const inputs = document.querySelectorAll('.verification-digit');
  return Array.from(inputs).map(input => input.value).join('');
}

// Event Listeners Setup
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Theme toggle clicked');
      toggleTheme();
    });
  }
  
  // Navigation buttons
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login button clicked');
      openModal('loginModal');
    });
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Register button clicked');
      openModal('registerModal');
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Logout button clicked');
      clearSession();
      showPage('landingPage');
    });
  }
  
  // Hero buttons
  const getStartedBtn = document.getElementById('getStartedBtn');
  const learnMoreBtn = document.getElementById('learnMoreBtn');
  
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Get Started button clicked');
      if (currentUser) {
        showPage(currentUser.role === 'admin' ? 'adminDashboard' : 'voterDashboard');
      } else {
        openModal('registerModal');
      }
    });
  }
  
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Learn More button clicked');
      const trustSection = document.querySelector('.trust-section');
      if (trustSection) {
        trustSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = e.target.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
  
  document.querySelectorAll('.modal-backdrop').forEach(element => {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = e.target.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Auth form switching
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');
  
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('loginModal');
      openModal('registerModal');
    });
  }
  
  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('registerModal');
      openModal('loginModal');
    });
  }
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted');
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // Clear previous errors
      clearFieldError('loginEmail');
      clearFieldError('loginPassword');
      
      // Validate
      let hasErrors = false;
      
      if (!validateEmail(email)) {
        showFieldError('loginEmail', 'Please enter a valid email address');
        hasErrors = true;
      }
      
      if (!password) {
        showFieldError('loginPassword', 'Password is required');
        hasErrors = true;
      }
      
      if (hasErrors) return;
      
      try {
        const result = await handleLogin(email, password);
        
        if (result.requiresTwoFactor) {
          closeModal('loginModal');
          openModal('twoFactorModal');
          
          // Store pending user
          window.pendingUser = result.user;
        }
      } catch (error) {
        showFieldError('loginPassword', error.message);
      }
    });
  }
  
  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Register form submitted');
      
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;
      
      // Clear previous errors
      ['registerName', 'registerEmail', 'registerPassword', 'registerConfirmPassword'].forEach(clearFieldError);
      
      // Validate
      let hasErrors = false;
      
      if (!name.trim()) {
        showFieldError('registerName', 'Full name is required');
        hasErrors = true;
      }
      
      if (!validateEmail(email)) {
        showFieldError('registerEmail', 'Please enter a valid email address');
        hasErrors = true;
      }
      
      if (!validatePassword(password)) {
        showFieldError('registerPassword', 'Password must be at least 8 characters long');
        hasErrors = true;
      }
      
      if (password !== confirmPassword) {
        showFieldError('registerConfirmPassword', 'Passwords do not match');
        hasErrors = true;
      }
      
      if (hasErrors) return;
      
      try {
        const result = await handleRegister(name, email, password);
        
        if (result.requiresTwoFactor) {
          closeModal('registerModal');
          openModal('twoFactorModal');
          
          // Store pending user
          window.pendingUser = result.user;
        }
      } catch (error) {
        showFieldError('registerEmail', error.message);
      }
    });
  }
  
  // Password strength indicator
  const registerPassword = document.getElementById('registerPassword');
  if (registerPassword) {
    registerPassword.addEventListener('input', (e) => {
      const password = e.target.value;
      const strengthEl = document.getElementById('passwordStrength');
      
      if (strengthEl) {
        if (password) {
          const strength = getPasswordStrength(password);
          strengthEl.textContent = `Password strength: ${strength}`;
          strengthEl.className = `password-strength ${strength}`;
        } else {
          strengthEl.textContent = '';
          strengthEl.className = 'password-strength';
        }
      }
    });
  }
  
  // Two-factor form
  const twoFactorForm = document.getElementById('twoFactorForm');
  if (twoFactorForm) {
    twoFactorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('2FA form submitted');
      
      const code = getTwoFactorCode();
      
      if (code.length !== 6) {
        alert('Please enter the complete 6-digit verification code');
        return;
      }
      
      try {
        const user = await handleTwoFactor(code, window.pendingUser);
        saveSession(user);
        closeModal('twoFactorModal');
        
        // Redirect to appropriate dashboard
        showPage(user.role === 'admin' ? 'adminDashboard' : 'voterDashboard');
        
        // Clear pending user
        window.pendingUser = null;
      } catch (error) {
        alert(error.message);
        // Clear inputs
        document.querySelectorAll('.verification-digit').forEach(input => input.value = '');
        const firstInput = document.querySelector('.verification-digit');
        if (firstInput) firstInput.focus();
      }
    });
  }
  
  // Resend code
  const resendCode = document.getElementById('resendCode');
  if (resendCode) {
    resendCode.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Verification code resent to your email address');
    });
  }
  
  // Carousel navigation
  const carouselNext = document.getElementById('carouselNext');
  const carouselPrev = document.getElementById('carouselPrev');
  
  if (carouselNext) {
    carouselNext.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Carousel next clicked');
      nextCarouselSlide();
    });
  }
  
  if (carouselPrev) {
    carouselPrev.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Carousel prev clicked');
      prevCarouselSlide();
    });
  }
  
  // Election selection - Use event delegation
  document.addEventListener('click', (e) => {
    const electionCard = e.target.closest('.election-card, .election-item');
    if (electionCard) {
      e.preventDefault();
      const electionId = electionCard.dataset.electionId;
      console.log('Election clicked:', electionId);
      
      if (currentUser) {
        startVoting(electionId);
      } else {
        openModal('loginModal');
      }
    }
  });
  
  // Voting navigation
  const nextQuestionBtn = document.getElementById('nextQuestion');
  const prevQuestionBtn = document.getElementById('prevQuestion');
  const reviewBallotBtn = document.getElementById('reviewBallot');
  const backToBallotBtn = document.getElementById('backToBallot');
  const submitVoteBtn = document.getElementById('submitVote');
  
  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', nextQuestion);
  }
  if (prevQuestionBtn) {
    prevQuestionBtn.addEventListener('click', prevQuestion);
  }
  if (reviewBallotBtn) {
    reviewBallotBtn.addEventListener('click', showReviewScreen);
  }
  if (backToBallotBtn) {
    backToBallotBtn.addEventListener('click', () => {
      showPage('votingInterface');
    });
  }
  if (submitVoteBtn) {
    submitVoteBtn.addEventListener('click', submitVote);
  }
  
  // Results page actions
  const shareParticipationBtn = document.getElementById('shareParticipation');
  const returnToDashboardBtn = document.getElementById('returnToDashboard');
  
  if (shareParticipationBtn) {
    shareParticipationBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'I Voted!',
          text: 'I participated in the democratic process by voting in the election.',
          url: window.location.href
        });
      } else {
        // Fallback for browsers without Web Share API
        const text = 'I participated in the democratic process by voting in the election.';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          alert('Message copied to clipboard!');
        } else {
          alert('Share: ' + text);
        }
      }
    });
  }
  
  if (returnToDashboardBtn) {
    returnToDashboardBtn.addEventListener('click', () => {
      showPage(currentUser.role === 'admin' ? 'adminDashboard' : 'voterDashboard');
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // ESC key closes modals
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal:not(.hidden)');
      openModals.forEach(modal => {
        closeModal(modal.id);
      });
    }
    
    // Arrow keys for carousel
    if (e.target.closest('.elections-carousel')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevCarouselSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCarouselSlide();
      }
    }
  });
  
  console.log('Event listeners setup complete');
}

// Initialize Application
function initializeApp() {
  console.log('Initializing SecureVote application...');
  
  // Initialize theme first
  initializeTheme();
  setupThemeListener();
  
  // Load initial data
  loadElections();
  loadTrustIndicators();
  loadUserStats();
  
  // Setup two-factor authentication inputs
  setupTwoFactorInputs();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load session if exists
  const session = loadSession();
  if (session) {
    updateAuthUI();
  }
  
  // Initialize carousel
  updateCarousel();
  
  // Ensure landing page is shown
  showPage('landingPage');
  
  console.log('SecureVote application initialized successfully');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
