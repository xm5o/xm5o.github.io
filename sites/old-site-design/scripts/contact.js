// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('span').style.opacity = '0.7';
        loadingSpinner.style.display = 'inline-block';

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Send form data
            const response = await fetch('https://formsubmit.co/ajax/eminem13981398@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Show success modal
                successModal.style.display = 'block';
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            alert('Sorry, there was an error sending your message. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.querySelector('span').style.opacity = '1';
            loadingSpinner.style.display = 'none';
        }
    });

    // Close modal when clicking the close button
    closeModal.addEventListener('click', function() {
        successModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Form validation
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            this.classList.add('invalid');
            
            // Show error message
            let errorMessage = this.nextElementSibling;
            if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                this.parentNode.insertBefore(errorMessage, this.nextSibling);
            }
            
            errorMessage.textContent = this.validationMessage;
            errorMessage.style.display = 'block';
        });

        input.addEventListener('input', function() {
            this.classList.remove('invalid');
            const errorMessage = this.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.style.display = 'none';
            }
        });
    });
});

// Add email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}