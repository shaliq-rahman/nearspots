// Profile page functionality
$(document).ready(function() {
    // Mobile sidebar toggle functionality
    $('.sidebar-toggle').on('click', function() {
        $('.sidebar').toggleClass('open');
        $(this).toggleClass('active');

        // Prevent body scrolling when menu is open
        if ($('.sidebar').hasClass('open')) {
            $('body').css('overflow', 'hidden');
        } else {
            $('body').css('overflow', '');
        }
    });

    // Close mobile menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.sidebar').length && !$(e.target).closest('.sidebar-toggle').length) {
            $('.sidebar').removeClass('open');
            $('.sidebar-toggle').removeClass('active');
            $('body').css('overflow', '');
        }
    });

    // Close mobile menu on window resize if screen becomes larger
    $(window).on('resize', function() {
        if ($(window).width() > 767) {
            $('.sidebar').removeClass('open');
            $('.sidebar-toggle').removeClass('active');
            $('body').css('overflow', '');
        }
    });

    // Handle escape key to close mobile menu
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.sidebar').removeClass('open');
            $('.sidebar-toggle').removeClass('active');
            $('body').css('overflow', '');
        }
    });

    // Close mobile menu when sidebar menu item is clicked
    $('.sidebar-menu li').on('click', function() {
        if ($(window).width() <= 767) {
            $('.sidebar').removeClass('open');
            $('.sidebar-toggle').removeClass('active');
            $('body').css('overflow', '');
        }
    });

    // Improve form input focus for mobile
    $('.form-group input, .form-group select').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });

    // Add touch-friendly interactions for mobile
    if ('ontouchstart' in window) {
        $('.sidebar-menu li').on('touchstart', function() {
            $(this).addClass('touch-active');
        }).on('touchend', function() {
            $(this).removeClass('touch-active');
        });
    }
    // Profile update form handling
    // $('.profile-update-form').on('submit', function(e) {
    //     e.preventDefault();
        
    //     // Clear previous errors
    //     clearErrors();
        
    //     // Get form data
    //     const formData = {
    //         first_name: $('#firstName').val().trim(),
    //         last_name: $('#lastName').val().trim(),
    //         csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
    //     };
        
    //     // Client-side validation
    //     const errors = validateProfileForm(formData);
    //     if (errors.length > 0) {
    //         displayErrors(errors);
    //         return;
    //     }
        
    //     // Show loading state
    //     const submitBtn = $(this).find('button[type="submit"]');
    //     const originalText = submitBtn.text();
    //     submitBtn.text('Saving...').prop('disabled', true);
        
    //     // Send AJAX request
    //     $.ajax({
    //         url: '/portal/update-profile/',
    //         type: 'POST',
    //         data: formData,
    //         success: function(response) {
    //             if (response.status === 'success') {
    //                 showNotification(response.message, 'success');
    //                 // Optionally update the displayed name on the page
    //                 setTimeout(function() {
    //                     location.reload();
    //                 }, 1500);
    //             }
    //         },
    //         error: function(xhr) {
    //             if (xhr.responseJSON) {
    //                 if (xhr.responseJSON.errors) {
    //                     displayFieldErrors(xhr.responseJSON.errors);
    //                 } else {
    //                     showNotification(xhr.responseJSON.message || 'An error occurred', 'error');
    //                 }
    //             } else {
    //                 showNotification('An unexpected error occurred', 'error');
    //             }
    //         },
    //         complete: function() {
    //             submitBtn.text(originalText).prop('disabled', false);
    //         }
    //     });
    // });
    
    // Password change form handling
    $('.profile-form').on('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Get form data
        const formData = {
            currentPassword: $('#currentPassword').val().trim(),
            newPassword: $('#newPassword').val().trim(),
            confirmPassword: $('#confirmPassword').val().trim(),
            csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
        };
        
        // Client-side validation
        const errors = validatePasswordForm(formData);
        if (errors.length > 0) {
            displayErrors(errors);
            return;
        }
        
        // Show loading state
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('Updating...').prop('disabled', true);
        
        // Send AJAX request
        $.ajax({
            url: '/change-password/',
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.status === 'success') {
                    showNotification(response.message, 'success');
                    // Clear form and errors
                    $('.profile-form')[0].reset();
                    clearErrors();
                    // Redirect to login page after a delay
                    setTimeout(function() {
                        window.location.href = response.redirect_url;
                    }, 2000);
                }
            },
            error: function(xhr) {
                if (xhr.responseJSON) {
                    if (xhr.responseJSON.errors) {
                        displayFieldErrors(xhr.responseJSON.errors);
                    } else {
                        showNotification(xhr.responseJSON.message || 'An error occurred', 'error');
                    }
                } else {
                    showNotification('An unexpected error occurred', 'error');
                }
            },
            complete: function() {
                submitBtn.text(originalText).prop('disabled', false);
            }
        });
    });
    
    // Real-time password validation and strength indicator
    $('#newPassword').on('input', function() {
        const password = $(this).val();
        
        // Only show strength indicator if password is not empty
        if (password) {
            const strength = checkPasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        } else {
            // Hide strength indicator if password is empty
            $('.password-strength').remove();
            // Also clear confirm password error if new password is cleared
            clearFieldError('confirmPassword');
        }
    });
    
    // Confirm password validation
    $('#confirmPassword').on('input', function() {
        const newPassword = $('#newPassword').val();
        const confirmPassword = $(this).val();
        
        // Only show error if both fields have values and they don't match
        if (confirmPassword && newPassword && newPassword !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
        } else if (confirmPassword && newPassword && newPassword === confirmPassword) {
            clearFieldError('confirmPassword');
        } else {
            // Clear error if either field is empty
            clearFieldError('confirmPassword');
        }
    });
});

// Validation functions
function validateProfileForm(data) {
    const errors = [];
    
    if (!data.first_name) {
        errors.push('First name is required');
    } else if (data.first_name.length < 2) {
        errors.push('First name must be at least 2 characters long');
    } else if (data.first_name.length > 50) {
        errors.push('First name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(data.first_name)) {
        errors.push('First name can only contain letters');
    }
    
    if (!data.last_name) {
        errors.push('Last name is required');
    } else if (data.last_name.length < 2) {
        errors.push('Last name must be at least 2 characters long');
    } else if (data.last_name.length > 50) {
        errors.push('Last name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(data.last_name)) {
        errors.push('Last name can only contain letters');
    }
    
    return errors;
}

function validatePasswordForm(data) {
    const errors = [];
    
    if (!data.currentPassword) {
        errors.push('Current password is required');
    }
    
    if (!data.newPassword) {
        errors.push('New password is required');
    } else if (data.newPassword.length < 8) {
        errors.push('New password must be at least 8 characters long');
    } else if (data.newPassword.length > 128) {
        errors.push('New password cannot exceed 128 characters');
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(data.newPassword)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    if (!data.confirmPassword) {
        errors.push('Please confirm your new password');
    } else if (data.newPassword !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return errors;
}

// Password strength checker
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score++;
    else feedback.push('One lowercase letter');
    
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('One uppercase letter');
    
    if (/\d/.test(password)) score++;
    else feedback.push('One number');
    
    if (/[@$!%*?&]/.test(password)) score++;
    else feedback.push('One special character');
    
    return {
        score: score,
        maxScore: 5,
        feedback: feedback,
        percentage: (score / 5) * 100
    };
}

// Update password strength indicator
function updatePasswordStrengthIndicator(strength) {
    const strengthBar = $('#password-strength-bar');
    const strengthText = $('#password-strength-text');
    
    if (!strengthBar.length) {
        // Create strength indicator if it doesn't exist
        const indicator = `
            <div class="password-strength" style="margin-top: 8px;">
                <div class="strength-bar" style="height: 4px; background: #eee; border-radius: 2px; overflow: hidden;">
                    <div id="password-strength-bar" style="height: 100%; transition: all 0.3s ease;"></div>
                </div>
                <div id="password-strength-text" style="font-size: 12px; margin-top: 4px; color: #666;"></div>
            </div>
        `;
        $('#newPassword').after(indicator);
    }
    
    let color, text;
    if (strength.percentage <= 20) {
        color = '#ff4444';
        text = 'Very Weak';
    } else if (strength.percentage <= 40) {
        color = '#ff8800';
        text = 'Weak';
    } else if (strength.percentage <= 60) {
        color = '#ffbb33';
        text = 'Fair';
    } else if (strength.percentage <= 80) {
        color = '#00C851';
        text = 'Good';
    } else {
        color = '#007E33';
        text = 'Strong';
    }
    
    // Update the strength indicator
    $('#password-strength-bar').css('width', strength.percentage + '%').css('background-color', color);
    $('#password-strength-text').text(text + ' (' + strength.score + '/5)').css('color', color);
}

// Error handling functions
function displayErrors(errors) {
    errors.forEach(function(error) {
        showNotification(error, 'error');
    });
}

function displayFieldErrors(fieldErrors) {
    Object.keys(fieldErrors).forEach(function(field) {
        showFieldError(field, fieldErrors[field]);
    });
}

function showFieldError(fieldName, message) {
    const field = $('#' + fieldName);
    // Remove any existing error for this field
    field.siblings('.field-error').remove();
    field.removeClass('error');
    // Add error class and message
    field.addClass('error');
    const errorDiv = $('<div class="field-error" style="color: #dc3545; font-size: 12px; margin-top: 4px;">' + message + '</div>');
    field.after(errorDiv);
}

function clearFieldError(fieldName) {
    const field = $('#' + fieldName);
    field.removeClass('error');
    field.siblings('.field-error').remove();
}

function clearErrors() {
    $('.field-error').remove();
    $('.form-group input').removeClass('error');
    // Also clear password strength indicator
    $('.password-strength').remove();
}

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    $('.notification').remove();
    
    const notification = $(`
        <div class="notification notification-${type}" style="
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        ">
            ${message}
        </div>
    `);
    
    // Set background color based on type
    if (type === 'success') {
        notification.css('background-color', '#28a745');
    } else if (type === 'error') {
        notification.css('background-color', '#dc3545');
    } else {
        notification.css('background-color', '#17a2b8');
    }
    
    $('body').append(notification);
    
    // Animate in
    setTimeout(function() {
        notification.css('transform', 'translateX(0)');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(function() {
        notification.css('transform', 'translateX(100%)');
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Allow manual close on click
    notification.on('click', function() {
        $(this).css('transform', 'translateX(100%)');
        setTimeout(function() {
            $(this).remove();
        }, 300);
    });
} 