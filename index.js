document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.1)';
            button.style.transition = 'transform 0.2s ease';
        });

        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('lightBulbLoader');
    const delay = 2000; // 2 seconds
    // Wait for 2 seconds, then add fade-out class
    setTimeout(() => {
        loader.classList.add('fade-out');

        // Remove the loader from the document flow after the fade-out transition
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000); // Match this duration to the CSS transition (1s in this case)
    }, delay);
});

// document.addEventListener('DOMContentLoaded', () => {
//     const loader = document.getElementById('lightBulbLoader');
//     const saarthiImage = document.querySelector('.saarthiImage');
//     const delay = 2000; // Delay for the loader to disappear

//     // Hide the loader and fade in the image
//     setTimeout(() => {
//         loader.classList.add('fade-out');

//         // Completely remove the loader after fade-out
//         setTimeout(() => {
//             loader.style.display = 'none';

//             // Fade in the saarthiImage
//             saarthiImage.style.display = 'flex'; // Make it visible
//             saarthiImage.classList.add('visible');
//         }, 1000); // Match fade-out duration
//     }, delay);
// });

document.addEventListener('DOMContentLoaded', () => {
    const line = document.querySelector('.line');
    const box = document.querySelector('.box');
    const imageWrapper = document.querySelector('.image-wrapper');
    const imageReveal = document.querySelector('.image-reveal');
    const image = document.querySelector('.image');

    // Initial delay before animation starts (in milliseconds)
    const initialDelay = 2000; // 2 seconds delay, adjust as needed

    // Start the animation sequence after initial delay
    setTimeout(() => {
        // Show the line first
        line.classList.add('show');
        
        // Then start the expansion sequence
        setTimeout(() => {
            // Expand the line
            line.classList.add('expand');
            
            // After line expands, expand the box
            setTimeout(() => {
                box.classList.add('expand');
                
                // After box expands, show the image wrapper
                setTimeout(() => {
                    imageWrapper.classList.add('show');
                    
                    // After wrapper is visible, animate the reveal
                    setTimeout(() => {
                        imageReveal.style.animation = 'revealImage 0.8s ease-in-out forwards';
                    }, 300);
                }, 500);
            }, 500);
        }, 500);
    }, initialDelay);
});

