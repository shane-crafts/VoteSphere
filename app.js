// Application data
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
  }
};

// Application state
let currentUser = null;
let currentBallot = null;
let selectedAnswers = {};
let statsAnimated = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeApp();
});

function initializeApp() {
  setupEventListeners();
  renderElections();
  initializeStats();
  showSection('home');
  console.log('App initialized successfully');
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Navigation events
  const homeLink = document.getElementById('homeLink');
  const dashboardLink = document.getElementById('dashboardLink');
  const resultsLink = document.getElementById('resultsLink');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const heroVoteBtn = document.getElementById('heroVoteBtn');
  
  if (homeLink) {
    homeLink.onclick = function(e) {
      e.preventDefault();
      showSection('home');
      return false;
    };
  }
  
  if (dashboardLink) {
    dashboardLink.onclick = function(e) {
      e.preventDefault();
      if (!currentUser) {
        showModal('login');
      } else {
        showSection('dashboard');
      }
      return false;
    };
  }
  
  if (resultsLink) {
    resultsLink.onclick = function(e) {
      e.preventDefault();
      showSection('results');
      return false;
    };
  }
  
  if (loginBtn) {
    loginBtn.onclick = function(e) {
      e.preventDefault();
      showModal('login');
      return false;
    };
  }
  
  if (logoutBtn) {
    logoutBtn.onclick = function(e) {
      e.preventDefault();
      logout();
      return false;
    };
  }
  
  if (heroVoteBtn) {
    heroVoteBtn.onclick = function(e) {
      e.preventDefault();
      if (!currentUser) {
        showModal('login');
      } else {
        showSection('dashboard');
      }
      return false;
    };
  }
  
  // Modal controls
  const closeModal = document.getElementById('closeModal');
  const closeVoting = document.getElementById('closeVotingModal');
  const closeSuccess = document.getElementById('closeSuccessModal');
  const submitVote = document.getElementById('submitVote');
  const cancelVote = document.getElementById('cancelVote');
  
  if (closeModal) {
    closeModal.onclick = function() {
      hideModal('login');
      return false;
    };
  }
  
  if (closeVoting) {
    closeVoting.onclick = function() {
      hideModal('voting');
      return false;
    };
  }
  
  if (closeSuccess) {
    closeSuccess.onclick = function() {
      hideModal('success');
      return false;
    };
  }
  
  if (submitVote) {
    submitVote.onclick = function() {
      submitVoteHandler();
      return false;
    };
  }
  
  if (cancelVote) {
    cancelVote.onclick = function() {
      hideModal('voting');
      return false;
    };
  }
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      handleLogin();
      return false;
    };
  }
  
  // Modal backdrop clicks
  const loginModal = document.getElementById('loginModal');
  const votingModal = document.getElementById('votingModal');
  const successModal = document.getElementById('successModal');
  
  if (loginModal) {
    loginModal.onclick = function(e) {
      if (e.target === loginModal) {
        hideModal('login');
      }
    };
  }
  
  if (votingModal) {
    votingModal.onclick = function(e) {
      if (e.target === votingModal) {
        hideModal('voting');
      }
    };
  }
  
  if (successModal) {
    successModal.onclick = function(e) {
      if (e.target === successModal) {
        hideModal('success');
      }
    };
  }
  
  // Keyboard events
  document.onkeydown = function(e) {
    if (e.key === 'Escape') {
      hideModal('login');
      hideModal('voting');
      hideModal('success');
    }
  };
  
  console.log('Event listeners set up successfully');
}

function showSection(sectionName) {
  console.log('Showing section:', sectionName);
  
  // Hide all sections
  const sections = ['homeSection', 'dashboardSection', 'resultsSection'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
  });
  
  // Remove active class from nav links
  const navLinks = ['homeLink', 'dashboardLink', 'resultsLink'];
  navLinks.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.remove('active');
  });
  
  // Show selected section
  const targetSection = document.getElementById(sectionName + 'Section');
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Activate nav link
  const targetLink = document.getElementById(sectionName + 'Link');
  if (targetLink) {
    targetLink.classList.add('active');
  }
}

function showModal(modalName) {
  console.log('Showing modal:', modalName);
  const modal = document.getElementById(modalName + 'Modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function hideModal(modalName) {
  console.log('Hiding modal:', modalName);
  const modal = document.getElementById(modalName + 'Modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 250);
  }
}

function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (username && password) {
    currentUser = {
      username: username,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    console.log('User logged in:', currentUser);
    updateAuthUI();
    hideModal('login');
    showSection('dashboard');
    
    // Reset form
    document.getElementById('loginForm').reset();
  }
}

function logout() {
  currentUser = null;
  console.log('User logged out');
  updateAuthUI();
  showSection('home');
}

function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (currentUser) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }
  
  renderElections();
}

function renderElections() {
  const container = document.getElementById('electionsList');
  if (!container) return;
  
  container.innerHTML = '';
  
  appData.elections.forEach(election => {
    const card = createElectionCard(election);
    container.appendChild(card);
  });
}

function createElectionCard(election) {
  const card = document.createElement('div');
  card.className = 'election-card';
  
  const statusClass = `status--${election.status}`;
  const canVote = currentUser && election.status === 'upcoming';
  
  card.innerHTML = `
    <h3 class="election-title">${election.title}</h3>
    <p class="election-description">${election.description}</p>
    <div class="election-meta">
      <span class="election-date">📅 ${formatDate(election.date)}</span>
      <span class="election-participants">👥 ${election.participants.toLocaleString()} participants</span>
    </div>
    <div style="margin-bottom: 16px;">
      <span class="status ${statusClass}">${election.status.charAt(0).toUpperCase() + election.status.slice(1)}</span>
    </div>
    <button class="vote-btn" ${canVote ? '' : 'disabled'} onclick="startVoting(${election.id})">
      ${canVote ? 'Vote Now' : election.status === 'completed' ? 'Voting Closed' : 'Login to Vote'}
    </button>
  `;
  
  return card;
}

function startVoting(electionId) {
  console.log('Starting voting for election:', electionId);
  
  if (!currentUser) {
    showModal('login');
    return;
  }
  
  const election = appData.elections.find(e => e.id === electionId);
  const ballot = appData.ballots[electionId.toString()];
  
  if (!ballot) {
    alert('Ballot not available for this election.');
    return;
  }
  
  currentBallot = ballot;
  selectedAnswers = {};
  
  renderBallot();
  showModal('voting');
}

function renderBallot() {
  const container = document.getElementById('ballotContent');
  const titleElement = document.getElementById('votingTitle');
  
  if (titleElement) titleElement.textContent = currentBallot.title;
  if (!container) return;
  
  container.innerHTML = '';
  
  currentBallot.questions.forEach(question => {
    const questionDiv = createBallotQuestion(question);
    container.appendChild(questionDiv);
  });
  
  updateSubmitButtonState();
}

function createBallotQuestion(question) {
  const div = document.createElement('div');
  div.className = 'ballot-question';
  
  div.innerHTML = `
    <h4 class="question-title">${question.question}</h4>
    <div class="ballot-options">
      ${question.options.map(option => `
        <label class="ballot-option" for="${question.id}_${option.id}">
          <input 
            type="radio" 
            id="${question.id}_${option.id}" 
            name="${question.id}" 
            value="${option.id}"
            onchange="handleOptionChange('${question.id}', '${option.id}')"
          >
          <div class="option-info">
            <div class="option-name">${option.name}</div>
            <div class="option-party">${option.party}</div>
          </div>
        </label>
      `).join('')}
    </div>
  `;
  
  return div;
}

function handleOptionChange(questionId, optionId) {
  selectedAnswers[questionId] = optionId;
  
  // Update visual state
  const labels = document.querySelectorAll(`input[name="${questionId}"]`);
  labels.forEach(input => {
    const label = input.closest('.ballot-option');
    if (input.value === optionId) {
      label.classList.add('selected');
    } else {
      label.classList.remove('selected');
    }
  });
  
  updateSubmitButtonState();
}

function updateSubmitButtonState() {
  if (!currentBallot) return;
  
  const submitButton = document.getElementById('submitVote');
  if (!submitButton) return;
  
  const totalQuestions = currentBallot.questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  
  submitButton.disabled = answeredQuestions < totalQuestions;
}

function submitVoteHandler() {
  if (!currentBallot) return;
  
  if (Object.keys(selectedAnswers).length < currentBallot.questions.length) {
    alert('Please answer all questions before submitting your vote.');
    return;
  }
  
  console.log('Vote submitted:', selectedAnswers);
  
  // Update UI to reflect vote cast
  const election = appData.elections.find(e => e.title === currentBallot.title);
  if (election) {
    election.participants += 1;
    appData.userStats.completedVotes += 1;
    renderElections();
    updateStatsDisplay();
  }
  
  // Show success modal
  hideModal('voting');
  setTimeout(() => {
    showModal('success');
  }, 300);
  
  // Reset voting state
  currentBallot = null;
  selectedAnswers = {};
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function initializeStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const values = [
    appData.userStats.totalUsers,
    appData.userStats.activeElections,
    appData.userStats.completedVotes
  ];
  
  statNumbers.forEach((element, index) => {
    element.textContent = values[index].toLocaleString();
  });
  
  if (!statsAnimated) {
    setTimeout(() => {
      animateStats();
      statsAnimated = true;
    }, 500);
  }
}

function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const values = [
    appData.userStats.totalUsers,
    appData.userStats.activeElections,
    appData.userStats.completedVotes
  ];
  
  statNumbers.forEach((element, index) => {
    element.textContent = '0';
    setTimeout(() => {
      animateValue(element, 0, values[index], 2000);
    }, index * 200);
  });
}

function animateValue(element, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();
  
  function updateValue(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const currentValue = Math.floor(start + (range * easeProgress));
    element.textContent = currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  }
  
  requestAnimationFrame(updateValue);
}

function updateStatsDisplay() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const values = [
    appData.userStats.totalUsers,
    appData.userStats.activeElections,
    appData.userStats.completedVotes
  ];
  
  statNumbers.forEach((element, index) => {
    element.textContent = values[index].toLocaleString();
  });
}