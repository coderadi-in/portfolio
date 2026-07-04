/**
 * Portfolio Intro Animation
 * 
 * Animation Sequence:
 *   Frame 1: Single dot fades in at center, then shifts to the left side (20px from left edge)
 *   Frame 2: More dots appear sequentially from left to right, forming a row
 *   Frame 3: All dots get sucked into the center (black hole effect)
 *   Frame 4: Supernova explosion from the center, filling the screen
 *   Frame 5: Everything fades out, revealing the main content
 * 
 * Dependencies: Requires DOM elements with IDs 'loader', 'loaderCanvas', and 'mainContent'
 */

(() => {
    // ============================================================
    // DOM ELEMENTS
    // ============================================================
    const loader = document.getElementById('loader');
    const canvas = document.getElementById('loaderCanvas');
    const mainContent = document.getElementById('main');
    const ctx = canvas.getContext('2d');

    // ============================================================
    // CONFIGURATION — easily tweak these values
    // ============================================================
    const CONFIG = {
        // Dot appearance
        dotTotalWidth: 16,           // Total width of dot including glow/shadow (px)
        dotCoreRadius: 5,            // Core dot radius (px) — smaller than half the total width
        glowRadius: 8,               // Glow extends to this radius (px), making total width = 16px
        dotSpacing: 32,              // Center-to-center spacing: 16px width + 8px left margin + 8px right margin
        leftMargin: 20,              // Distance from left edge of screen to the first dot's center

        // Phase timings (milliseconds from animation start)
        phase0_end: 1000,             // Frame 1: dot appears at center, then shifts left
        phase1_end: 2000,            // Frame 2: row of dots forms (600 ms window)
        phase2_end: 2600,            // Frame 3: black-hole suction (600 ms window)
        phase3_end: 3500,            // Frame 4: supernova explosion (900 ms window)
        fadeOutStart: 3500,          // Frame 5: loader starts fading out
        fadeOutDuration: 800,        // CSS transition duration for the fade

        // Supernova
        supernovaParticleCount: 130,
        supernovaFlashDuration: 280, // ms — the central bright flash

        // Colors
        bgColor: '#0F1115',
        dotColor: '#EBECF0',
        dotGlowColor: '#FFFFFF1A',
    };

    // ============================================================
    // STATE
    // ============================================================
    let animationStartTime = null;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let centerX = 0;
    let centerY = 0;
    let leftAnchorX = 0;
    let leftAnchorY = 0;
    let maxCornerDist = 0;           // max distance from center to a screen corner
    let totalDots = 0;               // calculated based on screen width

    // Dot objects (used in Frames 1–3)
    let dots = [];

    // Supernova particles (populated at start of Frame 4)
    let supernovaParticles = [];
    let supernovaInitialized = false;
    let supernovaFlashAlpha = 0;

    // Whether the fade-out has been triggered
    let fadeOutTriggered = false;

    // ============================================================
    // RESIZE HANDLER — recalculate dimensions
    // ============================================================
    function resizeCanvas() {
        // Cap device pixel ratio at 2x for better performance
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;

        // Set actual canvas pixel size
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;

        // Scale the drawing context so all coordinates are in CSS pixels
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        // Recalculate key positions
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
        
        // First dot's center is 20px from the left edge
        // Since the dot has a total width of 16px, its left edge would be at 20px - 8px = 12px from screen edge
        // But we want the dot's position to be 20px from the left edge
        // So the center should be at: leftMargin (20px) + half of total width (8px)
        leftAnchorX = CONFIG.leftMargin + (CONFIG.dotTotalWidth / 2);
        leftAnchorY = centerY;
        
        // Calculate how many dots fit on screen
        // Formula: window.innerWidth / dotSpacing
        totalDots = Math.floor(canvasWidth / CONFIG.dotSpacing);
        
        // Ensure at least 1 dot
        if (totalDots < 1) totalDots = 1;
        
        maxCornerDist = Math.sqrt(
            (canvasWidth / 2) ** 2 + (canvasHeight / 2) ** 2
        );
    }

    // ============================================================
    // INITIALIZE DOT POSITIONS (called on resize & at startup)
    // ============================================================
    function buildDotPositions() {
        dots = [];
        for (let i = 0; i < totalDots; i++) {
            dots.push({
                // Each dot sits to the right of the previous one
                // Center-to-center spacing is dotSpacing (32px)
                x: leftAnchorX + i * CONFIG.dotSpacing,
                y: leftAnchorY,
                opacity: 0, // starts invisible, animated per-phase
                // Store the row position for black-hole interpolation
                rowX: leftAnchorX + i * CONFIG.dotSpacing,
                rowY: leftAnchorY,
            });
        }
    }

    // ============================================================
    // EASING FUNCTIONS
    // ============================================================
    
    /**
     * Accelerating curve — perfect for black-hole suction
     * @param {number} t - Progress value between 0 and 1
     * @returns {number} Eased value
     */
    function easeInQuart(t) {
        return t * t * t * t;
    }

    /**
     * Decelerating curve — good for supernova particles slowing down
     * @param {number} t - Progress value between 0 and 1
     * @returns {number} Eased value
     */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Exponential ease out — for the flash fade
     * @param {number} t - Progress value between 0 and 1
     * @returns {number} Eased value
     */
    function easeOutExpo(t) {
        return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    /**
     * Clamp a value between min and max
     * @param {number} val - Value to clamp
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Clamped value
     */
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    /**
     * Interpolate between two RGB colors for supernova particle heat gradient
     * @param {Object} c1 - Starting color with r, g, b properties
     * @param {Object} c2 - Ending color with r, g, b properties
     * @param {number} t - Interpolation factor (0-1)
     * @returns {string} CSS rgb() color string
     */
    function lerpColor(c1, c2, t) {
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r},${g},${b})`;
    }

    // ============================================================
    // INITIALIZE SUPERNOVA PARTICLES
    // ============================================================
    function initSupernova() {
        supernovaParticles = [];
        const count = CONFIG.supernovaParticleCount;

        // Color stops for the heat gradient (from hot white to dark red)
        const hotWhite = { r: 255, g: 255, b: 250 };
        const warmYellow = { r: 255, g: 210, b: 40 };
        const deepOrange = { r: 255, g: 100, b: 10 };
        const darkRed = { r: 180, g: 25, b: 0 };

        for (let i = 0; i < count; i++) {
            // Random angle around the circle (full 360 degrees)
            const angle = Math.random() * Math.PI * 2;

            // Speed factor: 0.4 → 1.3 (some particles fast, some slow)
            const speedFactor = 0.4 + Math.random() * 0.9;

            // How far this particle will travel (fraction of max corner distance)
            const distanceFraction = 0.5 + Math.random() * 0.7;
            const targetDist = maxCornerDist * distanceFraction;
            
            // Calculate speed based on distance and phase duration
            const phase3Duration = CONFIG.phase3_end - CONFIG.phase2_end;
            const speed = (targetDist / phase3Duration) * speedFactor;

            // Slight randomization of angle for organic feel
            const angleJitter = (Math.random() - 0.5) * 0.15;
            const finalAngle = angle + angleJitter;

            // Particle size (smaller = faster debris, larger = slower chunks)
            const size = 1.2 + Math.random() * 5.5;

            // Color based on speed (faster → hotter/whiter)
            const colorT = clamp(speedFactor / 1.3, 0, 1);
            let color;
            if (colorT < 0.35) {
                color = lerpColor(hotWhite, warmYellow, colorT / 0.35);
            } else if (colorT < 0.7) {
                color = lerpColor(warmYellow, deepOrange, (colorT - 0.35) / 0.35);
            } else {
                color = lerpColor(deepOrange, darkRed, (colorT - 0.7) / 0.3);
            }

            supernovaParticles.push({
                angle: finalAngle,
                speed: speed,              // px per ms
                maxDist: targetDist,
                currentDist: 0,
                size: size,
                color: color,
                opacity: 1,
                // Slightly vary when each particle starts (staggered effect)
                startDelay: Math.random() * 40, // ms
            });
        }

        // Sort particles so faster (smaller, whiter) ones render on top
        supernovaParticles.sort((a, b) => b.speed - a.speed);

        supernovaInitialized = true;
        supernovaFlashAlpha = 1;
    }

    // ============================================================
    // DRAWING HELPERS
    // ============================================================

    /**
     * Draw a single dot with glow effect
     * The total visual width will be exactly CONFIG.dotTotalWidth (16px)
     * 
     * @param {number} x - X position (center of the dot)
     * @param {number} y - Y position (center of the dot)
     * @param {number} opacity - Opacity value (0-1)
     */
    function drawDot(x, y, opacity) {
        if (opacity <= 0) return;

        // Draw the glow first (behind the core dot)
        // The glow extends to glowRadius (8px), making the total width 16px
        if (CONFIG.glowRadius > 0 && opacity > 0) {
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.glowRadius, 0, Math.PI * 2);
            // Adjust glow opacity based on dot opacity
            const glowOpacity = CONFIG.dotGlowColor.replace('0.35', String(0.35 * opacity));
            ctx.fillStyle = glowOpacity;
            ctx.fill();
        }

        // Draw the core dot (smaller, solid white circle)
        if (CONFIG.dotCoreRadius > 0) {
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.dotCoreRadius, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.dotColor;
            ctx.globalAlpha = clamp(opacity, 0, 1);
            ctx.fill();
            ctx.globalAlpha = 1; // Reset alpha for other drawings
        }
    }

    /**
     * Draw the supernova central flash (radial gradient)
     * @param {number} alpha - Flash opacity (0-1)
     */
    function drawSupernovaFlash(alpha) {
        if (alpha <= 0) return;

        // Radial gradient: bright white center → transparent edge
        const maxRadius = maxCornerDist * 0.9;
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius
        );
        gradient.addColorStop(0, `rgba(255,255,245,${clamp(alpha, 0, 1)})`);
        gradient.addColorStop(0.15, `rgba(255,240,200,${clamp(alpha * 0.85, 0, 1)})`);
        gradient.addColorStop(0.4, `rgba(255,180,40,${clamp(alpha * 0.4, 0, 1)})`);
        gradient.addColorStop(0.7, `rgba(255,60,10,${clamp(alpha * 0.1, 0, 1)})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // ============================================================
    // MAIN ANIMATION LOOP
    // ============================================================

    /**
     * Animation frame callback — handles all phases based on elapsed time
     * @param {number} timestamp - Current time from requestAnimationFrame
     */
    function animate(timestamp) {
        // Record start time on the first frame
        if (animationStartTime === null) {
            animationStartTime = timestamp;
        }
        const elapsed = timestamp - animationStartTime;

        // Clear the canvas for this frame
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // --------------------------------------------------------
        // PHASE 0 — Frame 1: Single dot fades in at center, then
        //            after 200ms shifts to the left side (20px from edge).
        // --------------------------------------------------------
        if (elapsed < CONFIG.phase0_end) {
            const dot = dots[0];
            const phase0Progress = clamp(elapsed / CONFIG.phase0_end, 0, 1);

            if (elapsed < 200) {
                // First 200ms: dot fades in at center
                const fadeProgress = clamp(elapsed / 200, 0, 1);
                dot.opacity = fadeProgress;
                dot.x = centerX;
                dot.y = centerY;
            } else {
                // After 200ms: dot shifts from center to left anchor position (20px from left edge)
                const moveProgress = clamp((elapsed - 200) / (CONFIG.phase0_end - 200), 0, 1);
                const easedMove = easeOutCubic(moveProgress);
                dot.opacity = 1;
                dot.x = centerX + (leftAnchorX - centerX) * easedMove;
                dot.y = centerY + (leftAnchorY - centerY) * easedMove;
            }

            // Draw only the first dot
            drawDot(dot.x, dot.y, dot.opacity);
        }

        // --------------------------------------------------------
        // PHASE 1 — Frame 2: Row of dots fades in sequentially
        //            from left to right.
        // --------------------------------------------------------
        else if (elapsed < CONFIG.phase1_end) {
            const phase1Duration = CONFIG.phase1_end - CONFIG.phase0_end;
            const phase1Elapsed = elapsed - CONFIG.phase0_end;

            // Calculate how many dots should be visible by now
            // Dot 0 is already visible; dots 1..N-1 appear one by one
            const revealInterval = totalDots > 1 ? phase1Duration / (totalDots - 1) : 0;
            const dotsToReveal = totalDots > 1 ? Math.floor(phase1Elapsed / revealInterval) + 1 : 1;

            for (let i = 0; i < totalDots; i++) {
                const dot = dots[i];
                if (i < dotsToReveal) {
                    // This dot is revealed — calculate its fade-in progress
                    const dotRevealStart = i * revealInterval;
                    const dotFadeProgress = clamp(
                        (phase1Elapsed - dotRevealStart) / (revealInterval * 0.7),
                        0,
                        1
                    );
                    dot.opacity = dotFadeProgress;
                } else {
                    dot.opacity = 0;
                }
                
                // Position stays at the row location
                dot.x = dot.rowX;
                dot.y = dot.rowY;

                // Draw each dot
                drawDot(dot.x, dot.y, dot.opacity);
            }
        }

        // --------------------------------------------------------
        // PHASE 2 — Frame 3: Black-hole suction.
        //            All dots accelerate toward the center.
        // --------------------------------------------------------
        else if (elapsed < CONFIG.phase2_end) {
            const phase2Duration = CONFIG.phase2_end - CONFIG.phase1_end;
            const phase2Elapsed = elapsed - CONFIG.phase1_end;
            const rawProgress = clamp(phase2Elapsed / phase2Duration, 0, 1);
            const easedProgress = easeInQuart(rawProgress);

            for (const dot of dots) {
                // Interpolate from row position to center using eased progress
                dot.x = dot.rowX + (centerX - dot.rowX) * easedProgress;
                dot.y = dot.rowY + (centerY - dot.rowY) * easedProgress;
                
                // Slight fade as they near the center (simulates merging)
                dot.opacity = 1 - easedProgress * 0.3;

                // Draw a subtle motion trail effect
                const trailX = dot.rowX + (centerX - dot.rowX) * clamp(easedProgress - 0.06, 0, 1);
                const trailY = dot.rowY + (centerY - dot.rowY) * clamp(easedProgress - 0.06, 0, 1);
                if (easedProgress > 0.05) {
                    // Draw trail with reduced opacity
                    ctx.beginPath();
                    ctx.arc(trailX, trailY, CONFIG.dotCoreRadius * 0.7, 0, Math.PI * 2);
                    ctx.fillStyle = CONFIG.dotColor;
                    ctx.globalAlpha = clamp(dot.opacity * 0.25, 0, 1);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }

                // Draw the main dot
                drawDot(dot.x, dot.y, dot.opacity);
            }
        }

        // --------------------------------------------------------
        // PHASE 3 — Frame 4: Supernova explosion.
        //            Particles burst outward from center.
        // --------------------------------------------------------
        else if (elapsed < CONFIG.phase3_end) {
            const phase3Duration = CONFIG.phase3_end - CONFIG.phase2_end;
            const phase3Elapsed = elapsed - CONFIG.phase2_end;

            // Initialize particles on first frame of this phase
            if (!supernovaInitialized) {
                initSupernova();
            }

            // Update and draw the central flash
            const flashProgress = clamp(phase3Elapsed / CONFIG.supernovaFlashDuration, 0, 1);
            supernovaFlashAlpha = 1 - easeOutExpo(flashProgress);
            drawSupernovaFlash(supernovaFlashAlpha);

            // Update and draw each particle
            for (const p of supernovaParticles) {
                const effectiveElapsed = Math.max(0, phase3Elapsed - p.startDelay);
                const particleProgress = clamp(effectiveElapsed / phase3Duration, 0, 1);
                const easedProgress = easeOutCubic(particleProgress);

                // Distance from center increases with eased progress
                p.currentDist = p.maxDist * easedProgress;

                // Opacity fades as particle travels outward
                p.opacity = 1 - particleProgress * 0.85;

                // Slight size reduction over time
                const currentSize = p.size * (1 - particleProgress * 0.35);

                // Calculate current position
                const px = centerX + Math.cos(p.angle) * p.currentDist;
                const py = centerY + Math.sin(p.angle) * p.currentDist;

                // Draw the particle if it's still visible
                if (p.opacity > 0 && currentSize > 0.3) {
                    ctx.beginPath();
                    ctx.arc(px, py, currentSize, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = clamp(p.opacity, 0, 1);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
        }

        // --------------------------------------------------------
        // PHASE 4 — Frame 5: Trigger loader fade-out.
        // --------------------------------------------------------
        else {
            // Once we pass fadeOutStart, trigger the CSS opacity transition
            if (!fadeOutTriggered && elapsed >= CONFIG.fadeOutStart) {
                fadeOutTriggered = true;
                loader.classList.add('fade-out');
                mainContent.classList.add('visible');

                // After the CSS transition completes, hide the loader completely
                // This frees resources and allows full interaction with the page
                setTimeout(() => {
                    if (loader.parentNode) {
                        loader.style.display = 'none';
                    }
                }, CONFIG.fadeOutDuration + 50);
            }

            // Keep drawing fading supernova particles if they're still visible
            if (supernovaParticles.length > 0 && !fadeOutTriggered) {
                for (const p of supernovaParticles) {
                    if (p.opacity > 0.01) {
                        p.opacity *= 0.92; // Gradually fade out
                        const px = centerX + Math.cos(p.angle) * p.currentDist;
                        const py = centerY + Math.sin(p.angle) * p.currentDist;
                        ctx.beginPath();
                        ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = clamp(p.opacity, 0, 1);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }

        // Continue the animation loop until the loader is fully gone
        if (!fadeOutTriggered || elapsed < CONFIG.fadeOutStart + CONFIG.fadeOutDuration + 200) {
            requestAnimationFrame(animate);
        }
        // After that, the loop stops — no needless resource consumption
    }

    // ============================================================
    // BOOTSTRAP & INITIALIZATION
    // ============================================================

    /**
     * Initialize or reset the entire animation
     * Sets up canvas, builds dot positions, and starts the animation loop
     */
    function init() {
        resizeCanvas();
        buildDotPositions();
        supernovaInitialized = false;
        supernovaParticles = [];
        supernovaFlashAlpha = 0;
        fadeOutTriggered = false;
        animationStartTime = null;

        // Ensure loader is visible and main content is hidden
        loader.classList.remove('fade-out');
        loader.style.display = 'flex';
        mainContent.classList.remove('visible');

        // Start the animation loop
        requestAnimationFrame(animate);
    }

    // Handle window resize with debouncing for performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            buildDotPositions();
            
            // If supernova already initialized, recalculate particle target distances
            if (supernovaInitialized && supernovaParticles.length > 0) {
                for (const p of supernovaParticles) {
                    p.maxDist = maxCornerDist * (0.5 + Math.random() * 0.7);
                }
            }
        }, 150); // 150ms debounce delay
    });

    // Kick everything off
    init();

    // ============================================================
    // PUBLIC API — Expose replay function for testing/debugging
    // Can be called from the console: window.replayIntro()
    // ============================================================
    window.replayIntro = () => {
        init();
    };
})();