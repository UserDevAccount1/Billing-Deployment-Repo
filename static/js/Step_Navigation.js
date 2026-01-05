document.addEventListener("DOMContentLoaded", () => {
    // Select headers and content divs
    const steps = document.querySelectorAll(".stepper .step");
    const stepContents = document.querySelectorAll(".step-content");

    function activateStep(stepNumber) {
        const stepNumStr = stepNumber.toString();

        // 1. Update Header Badges (Keep this for the visual "bubble" styling)
        steps.forEach(step => {
            const sNum = step.getAttribute("data-step");
            if (sNum === stepNumStr) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });

        // 2. Show/Hide Content Divs using Inline JS Styles
        stepContents.forEach(content => {
            if (content.id === `step-content-${stepNumStr}`) {
                // Show the matching div
                content.style.display = "block";
            } else {
                // Hide all other divs
                content.style.display = "none";
            }
        });
    }

    // 3. Add Click Listeners
    steps.forEach(step => {
        step.addEventListener("click", () => {
            const stepNum = step.getAttribute("data-step");
            activateStep(stepNum);
        });
    });

    // 4. Initialize: Run once on load to ensure only Step 1 is visible
    activateStep(1);
});