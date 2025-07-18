// Initialize Vanta.js Globe background animation in the hero
VANTA.GLOBE({
  el: "#anim_globe",       // element to attach the globe
  mouseControls: false,
  touchControls: false,
  gyroControls: false,
  minHeight: 500.00,
  minWidth: 500.00,
  scale: 1.0,
  scaleMobile: 1.0,
  color: 0x00ffff,        // primary color (cyan)
  color2: 0x0088ff,       // secondary color (blue)
  backgroundColor: 0x000000  // background (black)
});

// Setup Chart.js radar chart for Skill Profile visualization
const ctx = document.getElementById('skillChart').getContext('2d');
// Sample data for skills (Technical, Soft, Domain-specific)
new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Technical Skills', 'Soft Skills', 'Domain Knowledge'],
    datasets: [{
      label: 'Your Skill Profile',
      data: [85, 70, 78],  // example percentage scores in each category
      backgroundColor: 'rgba(0, 204, 204, 0.2)',   // translucent fill (cyan)
      borderColor: 'rgba(0, 204, 204, 0.8)',       // border color
      borderWidth: 2,
      pointBackgroundColor: '#00ffff'
    }]
  },
  options: {
    scales: {
      r: {  // radial axis (for radar chart)
        angleLines: { color: '#999' },
        grid: { color: '#ccc' },
        pointLabels: { font: { size: 14, weight: '500' } },
        ticks: {
          display: false  // hide numerical scale
        }
      }
    },
    plugins: {
      legend: { display: false }  // no legend needed (only one dataset)
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
