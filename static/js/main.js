// Get references to elements
const profileBtn = document.getElementById('option-btn');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('close-btn');

// Show the sidebar when profile button is clicked
profileBtn.addEventListener('click', () => {
  sidebar.classList.add('open');
  console.log("Sidebar was opened");
});

// Hide the sidebar when close button is clicked
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('open');
});