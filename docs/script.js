// Initialize Vanta.js Globe background animation in the hero
VANTA.GLOBE({
  el: "#anim_globe",
  mouseControls: false,
  touchControls: false,
  gyroControls: false,
  minHeight: 500.00,
  minWidth: 500.00,
  scale: 1.0,
  scaleMobile: 1.0,
  color: 0x00ffff,
  color2: 0x0088ff,
  backgroundColor: 0x000000
});

// Setup Chart.js radar chart for Skill Profile visualization
const ctx = document.getElementById('skillChart').getContext('2d');
// Store chart instance for potential future updates or interactions
const skillChart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Technical Skills', 'Soft Skills', 'Domain Knowledge'],
    datasets: [{
      label: 'Your Skill Profile',
      data: [85, 70, 78],
      backgroundColor: 'rgba(0, 204, 204, 0.2)',
      borderColor: 'rgba(0, 204, 204, 0.8)',
      borderWidth: 2,
      pointBackgroundColor: '#00ffff'
    }]
  },
  options: {
    scales: {
      r: {
        angleLines: { color: '#999' },
        grid: { color: '#ccc' },
        pointLabels: { font: { size: 14, weight: '500' } },
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }
});

// Contact form submission handler (static simulation)
const contactForm = document.getElementById('contactForm');
if(contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert("Thank you for reaching out! We'll get back to you soon.");
    contactForm.reset();
  });
}
