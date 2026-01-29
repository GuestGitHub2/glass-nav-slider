// Get all list items (buttons)
const list = document.querySelectorAll('.nav-links li');
// Get the sliding box
const slider = document.querySelector('.slider');

// Function to calculate where to slide
function moveSlider(index) {
    // 100% width divided by 4 items = 25% per item.
    // If index is 0, move 0%. If index is 1, move 25%, etc.
    const position = index * 100; 
    slider.style.transform = `translateX(${position}%)`;
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
        
        // Move the slider to this item's index
        moveSlider(index);
    });
});
