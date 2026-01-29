// Get all list items (buttons)
const list = document.querySelectorAll('.nav-links li');
// Get the sliding box
const slider = document.querySelector('.slider');

// Physics-based animation parameters
let currentPosition = 0;
let targetPosition = 0;
let velocity = 0;
const springStiffness = 0.15;  // Higher = stiffer spring
const dampingFactor = 0.7;     // Higher = more damping (less bounce)

// Function to calculate target position with accurate physics
function moveSlider(index) {
    // Calculate target position considering gaps
    const itemWidth = 100 / list.length;
    targetPosition = index * itemWidth;
}

// Physics animation loop with spring dynamics
function animateSlider() {
    // Spring physics calculation
    const displacement = targetPosition - currentPosition;
    const springForce = displacement * springStiffness;
    
    // Apply spring force to velocity
    velocity += springForce;
    
    // Apply damping to velocity
    velocity *= dampingFactor;
    
    // Update position based on velocity
    currentPosition += velocity;
    
    // Apply position to slider with accurate transform
    slider.style.transform = `translateX(${currentPosition}%) translateY(-50%)`;
    
    // Continue animation if still moving (threshold for stopping)
    if (Math.abs(velocity) > 0.01 || Math.abs(displacement) > 0.01) {
        requestAnimationFrame(animateSlider);
    } else {
        // Snap to exact position when close enough
        currentPosition = targetPosition;
        slider.style.transform = `translateX(${currentPosition}%) translateY(-50%)`;
    }
}

// Add click event to every icon
list.forEach((item, index) => {
    item.addEventListener('click', (e) => {
        // Prevent default link jump
        e.preventDefault(); 
        
        // Remove 'active' class from all items
        list.forEach(li => li.classList.remove('active'));
        
        // Add 'active' class to the clicked item
        item.classList.add('active');
        
        // Set target position and start physics animation
        moveSlider(index);
        animateSlider();
    });
    
    // Add touch support for mobile
    item.addEventListener('touchstart', (e) => {
        e.preventDefault();
        item.click();
    }, { passive: false });
});

// Add hover effects that mimic magnifying glass distortion
list.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
        const text = item.querySelector('.text');
        if (text) {
            // Simulate slight magnification on hover
            text.style.transform = 'scale(1.08)';
            text.style.letterSpacing = '0.8px';
        }
    });
    
    item.addEventListener('mouseleave', () => {
        const text = item.querySelector('.text');
        if (text && !item.classList.contains('active')) {
            text.style.transform = 'scale(1)';
            text.style.letterSpacing = 'normal';
        }
    });
});

// Initialize slider position on page load
window.addEventListener('DOMContentLoaded', () => {
    const activeIndex = Array.from(list).findIndex(item => item.classList.contains('active'));
    if (activeIndex !== -1) {
        currentPosition = (activeIndex * 100) / list.length;
        targetPosition = currentPosition;
        slider.style.transform = `translateX(${currentPosition}%) translateY(-50%)`;
    }
});
