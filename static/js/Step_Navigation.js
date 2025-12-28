/* ════════════════════════════════════════════════════════════
   STEP NAVIGATION SYSTEM - Isolated Module
   ════════════════════════════════════════════════════════════ */

(function() {
  'use strict';
  
  // Namespace to avoid conflicts
  const StepNavigationSystem = {
    currentStep: 1,
    totalSteps: 0,
    containerSelector: '#billing-run-container',
    
    // Initialize the step navigation system
    init: function() {
      console.log('[Step Navigation System] Initializing...');
      
      const container = document.querySelector(this.containerSelector);
      if (!container) {
        console.warn('[Step Navigation System] Container not found:', this.containerSelector);
        return;
      }
      
      this.setupSteps();
      this.attachEventListeners();
      this.activateStep(1); // Start with step 1
      
      console.log('[Step Navigation System] Initialized successfully');
    },
    
    // Setup step elements
    setupSteps: function() {
      const container = document.querySelector(this.containerSelector);
      const steps = container.querySelectorAll('.step-badges-container .step[data-step]');
      this.totalSteps = steps.length;
      
      console.log('[Step Navigation System] Found', this.totalSteps, 'steps');
    },
    
    // Attach click event listeners to steps
    attachEventListeners: function() {
      const container = document.querySelector(this.containerSelector);
      const steps = container.querySelectorAll('.step-badges-container .step[data-step]');
      
      steps.forEach(step => {
        step.addEventListener('click', (e) => {
          const stepNumber = parseInt(step.getAttribute('data-step'));
          this.activateStep(stepNumber);
        });
      });
      
      console.log('[Step Navigation System] Event listeners attached');
    },
    
    // Activate a specific step
    activateStep: function(stepNumber) {
      const container = document.querySelector(this.containerSelector);
      if (!container) return;
      
      console.log('[Step Navigation System] Activating step:', stepNumber);
      
      // Validate step number
      if (stepNumber < 1 || stepNumber > this.totalSteps) {
        console.warn('[Step Navigation System] Invalid step number:', stepNumber);
        return;
      }
      
      // Remove active class from all steps
      const allSteps = container.querySelectorAll('.step-badges-container .step');
      allSteps.forEach(step => {
        step.classList.remove('active');
      });
      
      // Hide all step contents
      const allContents = container.querySelectorAll('.step-content');
      allContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      
      // Activate the selected step badge
      const selectedStep = container.querySelector(`.step-badges-container .step[data-step="${stepNumber}"]`);
      if (selectedStep) {
        selectedStep.classList.add('active');
      }
      
      // Show the selected step content
      const selectedContent = container.querySelector(`#step-content-${stepNumber}`);
      if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
      } else {
        console.warn('[Step Navigation System] Content not found for step:', stepNumber);
      }
      
      // Update current step
      this.currentStep = stepNumber;
      
      // Update progress bar
      this.updateProgressBar(stepNumber);
      
      // Show notification
      this.showStepNotification(stepNumber);
      
      console.log('[Step Navigation System] Step', stepNumber, 'activated');
    },
    
    // Update progress bar
    updateProgressBar: function(currentStep) {
      const container = document.querySelector(this.containerSelector);
      if (!container) return;
      
      const progressBar = container.querySelector('.progress-bar');
      if (!progressBar) return;
      
      const progress = (currentStep / this.totalSteps) * 100;
      progressBar.style.width = `${progress}%`;
    },
    
    // Show step notification
    showStepNotification: function(stepNumber) {
      const container = document.querySelector(this.containerSelector);
      if (!container) return;
      
      const step = container.querySelector(`.step[data-step="${stepNumber}"]`);
      if (!step) return;
      
      const stepLabel = step.querySelector('.step-label');
      const stepName = stepLabel ? stepLabel.textContent : `Step ${stepNumber}`;
      
      // Use existing toast function if available
      if (typeof showToast === 'function') {
        showToast(`Navigated to ${stepName}`, 'info');
      } else {
        console.log(`[Step Navigation System] Navigated to ${stepName}`);
      }
    },
    
    // Navigate to next step
    goToNext: function() {
      if (this.currentStep < this.totalSteps) {
        this.activateStep(this.currentStep + 1);
      }
    },
    
    // Navigate to previous step
    goToPrevious: function() {
      if (this.currentStep > 1) {
        this.activateStep(this.currentStep - 1);
      }
    },
    
    // Mark step as completed
    markStepCompleted: function(stepNumber) {
      const container = document.querySelector(this.containerSelector);
      if (!container) return;
      
      const step = container.querySelector(`.step[data-step="${stepNumber}"]`);
      if (step) {
        step.classList.add('completed');
        console.log('[Step Navigation System] Step', stepNumber, 'marked as completed');
      }
    },
    
    // Get current step
    getCurrentStep: function() {
      return this.currentStep;
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      StepNavigationSystem.init();
    });
  } else {
    StepNavigationSystem.init();
  }
  
  // Export to global scope with unique namespace
  window.BillingRunStepNavigation = {
    goToStep: (stepNumber) => StepNavigationSystem.activateStep(stepNumber),
    nextStep: () => StepNavigationSystem.goToNext(),
    previousStep: () => StepNavigationSystem.goToPrevious(),
    markCompleted: (stepNumber) => StepNavigationSystem.markStepCompleted(stepNumber),
    getCurrentStep: () => StepNavigationSystem.getCurrentStep()
  };
  
  console.log('[Step Navigation System] Module loaded. Access via window.BillingRunStepNavigation');
  
})();

// Navigate to a specific step
window.BillingRunStepNavigation.goToStep(3);

// Go to next step
window.BillingRunStepNavigation.nextStep();

// Go to previous step
window.BillingRunStepNavigation.previousStep();

// Mark a step as completed
window.BillingRunStepNavigation.markCompleted(1);

// Get current step number
const current = window.BillingRunStepNavigation.getCurrentStep();