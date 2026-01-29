// --- CONFIGURATION LOGIC ---
const root = document.documentElement;

// Elements
const inputs = {
    posX: document.getElementById('posX'),
    posY: document.getElementById('posY'),
    navOpacity: document.getElementById('navOpacity'),
    blurStrength: document.getElementById('blurStrength'),
    saturation: document.getElementById('saturation'),
    glassIntensity: document.getElementById('glassIntensity'),
    overshoot: document.getElementById('overshoot'),
    borderAlpha: document.getElementById('borderAlpha'),
    shadowAlpha: document.getElementById('shadowAlpha'),
    themeRange: document.getElementById('themeRange')
};

// Helper to update the number display
function updateVal(id, value) {
    document.getElementById(`val-${id}`).textContent = value;
}

// 1. Position X & Y
inputs.posX.addEventListener('input', (e) => {
    root.style.setProperty('--pos-x', `${e.target.value}px`);
    updateVal('posX', e.target.value);
});
inputs.posY.addEventListener('input', (e) => {
    root.style.setProperty('--pos-y', `${e.target.value}px`);
    updateVal('posY', e.target.value);
});

// 2. Material
inputs.navOpacity.addEventListener('input', (e) => {
    root.style.setProperty('--nav-alpha', e.target.value / 100);
    updateVal('navOpacity', e.target.value);
});
inputs.blurStrength.addEventListener('input', (e) => {
    root.style.setProperty('--blur-size', `${e.target.value}px`);
    updateVal('blurStrength', e.target.value);
});
inputs.saturation.addEventListener('input', (e) => {
    root.style.setProperty('--saturation', `${e.target.value}%`);
    updateVal('saturation', e.target.value);
});

// 2.25 Glass intensity
inputs.glassIntensity.addEventListener('input', (e) => {
    root.style.setProperty('--glassy-intensity', e.target.value);
    updateVal('glassIntensity', e.target.value);
});

// 2.5 Overshoot
inputs.overshoot.addEventListener('input', (e) => {
    updateVal('overshoot', e.target.value);
    updateOvershootTuning(Number(e.target.value));
});

// 3. Edges
inputs.borderAlpha.addEventListener('input', (e) => {
    root.style.setProperty('--border-alpha', e.target.value / 100);
    updateVal('borderAlpha', e.target.value);
});
inputs.shadowAlpha.addEventListener('input', (e) => {
    root.style.setProperty('--shadow-alpha', e.target.value / 100);
    updateVal('shadowAlpha', e.target.value);
});

// 4. Theme
inputs.themeRange.addEventListener('input', (e) => {
    const val = e.target.value;
    root.style.setProperty('--base-r', val);
    root.style.setProperty('--base-g', val);
    root.style.setProperty('--base-b', val);
    updateVal('themeRange', val);
});

document.getElementById('togglePanel').addEventListener('click', () => {
    const content = document.querySelector('.panel-content');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
});

// --- PANEL DRAGGING ---
const controlsPanel = document.getElementById('controlsPanel');
const panelHeader = document.getElementById('panelHeader');
let panelDrag = { isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 };

panelHeader.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;

    panelDrag.isDragging = true;
    panelDrag.startX = e.clientX;
    panelDrag.startY = e.clientY;

    const rect = controlsPanel.getBoundingClientRect();
    panelDrag.startLeft = rect.left;
    panelDrag.startTop = rect.top;

    controlsPanel.classList.add('is-dragging');
    panelHeader.style.cursor = 'grabbing';

    if (panelHeader.setPointerCapture) {
        panelHeader.setPointerCapture(e.pointerId);
    }
});

window.addEventListener('pointermove', (e) => {
    if (!panelDrag.isDragging) return;

    const deltaX = e.clientX - panelDrag.startX;
    const deltaY = e.clientY - panelDrag.startY;

    const newLeft = panelDrag.startLeft + deltaX;
    const newTop = panelDrag.startTop + deltaY;

    controlsPanel.style.left = `${newLeft}px`;
    controlsPanel.style.top = `${newTop}px`;
    controlsPanel.style.right = 'auto';
    controlsPanel.style.bottom = 'auto';
});

window.addEventListener('pointerup', (e) => {
    if (!panelDrag.isDragging) return;
    panelDrag.isDragging = false;
    controlsPanel.classList.remove('is-dragging');
    panelHeader.style.cursor = 'grab';

    if (panelHeader.releasePointerCapture) {
        panelHeader.releasePointerCapture(e.pointerId);
    }
});


// --- GLASS SLIDER SVG FILTER SETUP ---
class SliderGlassEffect {
    constructor() {
        this.slider = document.querySelector('.slider');
        this.feImageRef = document.getElementById('slider-fe-image');
        this.redChannelRef = document.getElementById('slider-red-channel');
        this.greenChannelRef = document.getElementById('slider-green-channel');
        this.blueChannelRef = document.getElementById('slider-blue-channel');
        this.gaussianBlurRef = document.getElementById('slider-blur');
        
        this.config = {
            displace: 0.3,
            distortionScale: -150,
            redOffset: 0,
            greenOffset: 8,
            blueOffset: 16,
            brightness: 45,
            opacity: 0.9
        };
        
        if (this.slider) {
            this.updateDisplacementMap();
            window.addEventListener('resize', () => this.updateDisplacementMap());
        }
    }
    
    updateDisplacementMap() {
        if (!this.slider || !this.feImageRef) return;
        
        const rect = this.slider.getBoundingClientRect();
        const width = rect.width || 100;
        const height = rect.height || 60;
        
        const svgContent = `
            <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="red-grad" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#0000"/>
                        <stop offset="100%" stop-color="red"/>
                    </linearGradient>
                    <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0000"/>
                        <stop offset="100%" stop-color="blue"/>
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
                <rect x="0" y="0" width="${width}" height="${height}" rx="40" fill="url(#red-grad)" />
                <rect x="0" y="0" width="${width}" height="${height}" rx="40" fill="url(#blue-grad)" style="mix-blend-mode: difference" />
                <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="38" fill="hsl(0 0% ${this.config.brightness}% / ${this.config.opacity})" style="filter:blur(8px)" />
            </svg>
        `;
        
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
        this.feImageRef.setAttribute('href', dataUrl);
        
        // Update displacement channels
        this.redChannelRef?.setAttribute('scale', this.config.distortionScale.toString());
        this.greenChannelRef?.setAttribute('scale', (this.config.distortionScale + this.config.greenOffset).toString());
        this.blueChannelRef?.setAttribute('scale', (this.config.distortionScale + this.config.blueOffset).toString());
        this.gaussianBlurRef?.setAttribute('stdDeviation', this.config.displace.toString());
    }
}

// Initialize slider glass effect
const sliderGlass = new SliderGlassEffect();

// --- NAV SLIDER LOGIC WITH PHYSICS ---
const nav = document.querySelector('.glass-nav');
const listItems = document.querySelectorAll('.nav-links li');
const slider = document.querySelector('.slider');

let isDragging = false;
let startX;
let initialSliderLeft;
let currentSliderLeft;
let dragDistance = 0;

// Velocity tracking for momentum
let lastX = 0;
let lastTime = 0;
let velocity = 0;

// Spring animation state
const motion = {
    pos: 0,
    vel: 0,
    target: 0,
    width: 0,
    widthVel: 0,
    widthTarget: 0,
    isAnimating: false,
    lastTime: 0
};

const physicsConfig = {
    stiffness: 0.12,
    damping: 0.86,
    widthStiffness: 0.16,
    widthDamping: 0.88,
    momentumMs: 220,
    edgeResistance: 0.35
};

function updateOvershootTuning(value) {
    const t = Math.min(Math.max(value / 100, 0), 1);
    // Lower t = tighter, higher t = bouncier
    physicsConfig.stiffness = 0.12 + t * 0.08; // 0.12 -> 0.20
    physicsConfig.damping = 0.9 - t * 0.22; // 0.90 -> 0.68
    physicsConfig.widthStiffness = 0.16 + t * 0.1; // 0.16 -> 0.26
    physicsConfig.widthDamping = 0.92 - t * 0.26; // 0.92 -> 0.66
}

function init() {
    const activeItem = document.querySelector('.nav-links li.active');
    root.style.setProperty('--glassy-intensity', inputs.glassIntensity.value);
    updateOvershootTuning(Number(inputs.overshoot.value));
    snapToItem(activeItem, false);
}

function renderSlider() {
    slider.style.transform = `translateX(${motion.pos}px)`;
    slider.style.width = `${motion.width}px`;
    currentSliderLeft = motion.pos;
}

function setActiveItem(item) {
    listItems.forEach(li => li.classList.remove('active'));
    item.classList.add('active');
}

function measureItem(item) {
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return {
        left: itemRect.left - navRect.left,
        width: itemRect.width
    };
}

function snapToItem(item, animate = true) {
    const { left, width } = measureItem(item);
    motion.target = left;
    motion.widthTarget = width;

    if (!animate) {
        motion.pos = left;
        motion.width = width;
        motion.vel = 0;
        motion.widthVel = 0;
        renderSlider();
    } else {
        startAnimation();
    }

    setActiveItem(item);
}

function startAnimation() {
    if (motion.isAnimating) return;
    motion.isAnimating = true;
    motion.lastTime = performance.now();
    requestAnimationFrame(step);
}

function stopAnimation() {
    motion.isAnimating = false;
}

function step(now) {
    if (!motion.isAnimating) return;
    const delta = now - motion.lastTime;
    motion.lastTime = now;
    const dt = Math.min(delta / 16.6667, 3);

    // Spring for position
    motion.vel += (motion.target - motion.pos) * physicsConfig.stiffness * dt;
    motion.vel *= Math.pow(physicsConfig.damping, dt);
    motion.pos += motion.vel * dt;

    // Spring for width
    motion.widthVel += (motion.widthTarget - motion.width) * physicsConfig.widthStiffness * dt;
    motion.widthVel *= Math.pow(physicsConfig.widthDamping, dt);
    motion.width += motion.widthVel * dt;

    renderSlider();

    const isSettled =
        Math.abs(motion.target - motion.pos) < 0.2 &&
        Math.abs(motion.vel) < 0.2 &&
        Math.abs(motion.widthTarget - motion.width) < 0.2 &&
        Math.abs(motion.widthVel) < 0.2;

    if (!isSettled) {
        requestAnimationFrame(step);
    } else {
        motion.pos = motion.target;
        motion.width = motion.widthTarget;
        motion.vel = 0;
        motion.widthVel = 0;
        renderSlider();
        stopAnimation();
    }
}

function findClosestItem(predictedX) {
    const navRect = nav.getBoundingClientRect();
    // Use predictedX if provided (for throwing), otherwise current position
    const searchX = predictedX !== undefined ? predictedX : (currentSliderLeft + (slider.offsetWidth / 2));
    
    let closestItem = null;
    let minDistance = Infinity;

    listItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = (itemRect.left - navRect.left) + (itemRect.width / 2);
        const distance = Math.abs(searchX - itemCenter);
        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    });
    return closestItem;
}

function applyRubberBand(value, min, max, resistance) {
    if (value < min) return min - (min - value) * resistance;
    if (value > max) return max + (value - max) * resistance;
    return value;
}

function updateGlassyFromPointer(e) {
    // Removed - now using SVG filter effect
}

// Global Drag Preventer to fix "Browser thinks it's a link" bug
document.addEventListener('dragstart', function(e) {
    if (e.target.closest('.glass-nav')) {
        e.preventDefault();
    }
});

nav.addEventListener('pointerenter', (e) => {
    updateGlassyFromPointer(e);
});

nav.addEventListener('pointermove', (e) => {
    updateGlassyFromPointer(e);
});

nav.addEventListener('pointerleave', () => {
    slider.style.setProperty('--glassy-proximity', '0');
});

nav.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    initialSliderLeft = currentSliderLeft;
    stopAnimation();
    dragDistance = 0;
    
    // Physics Reset
    lastX = e.clientX;
    lastTime = performance.now();
    velocity = 0;
    
    slider.style.transition = 'none';
    slider.style.cursor = 'grabbing';
    slider.classList.add('is-grabbed');
    if (nav.setPointerCapture) {
        nav.setPointerCapture(e.pointerId);
    }
});

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.clientX - startX;
    dragDistance = Math.max(dragDistance, Math.abs(deltaX));
    let newLeft = initialSliderLeft + deltaX;
    const maxLeft = nav.offsetWidth - slider.offsetWidth;
    newLeft = applyRubberBand(newLeft, 0, maxLeft, physicsConfig.edgeResistance);
    
    // Calculate Velocity for Throwing (smoothed)
    const now = performance.now();
    const dt = Math.max(now - lastTime, 8);
    const instantVelocity = (e.clientX - lastX) / dt; // pixels per ms
    velocity = velocity * 0.8 + instantVelocity * 0.2;
    lastX = e.clientX;
    lastTime = now;
    
    motion.pos = newLeft;
    motion.target = newLeft;
    motion.vel = 0;
    renderSlider();
    updateGlassyFromPointer(e);
});

window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    slider.style.cursor = 'grab';
    slider.classList.remove('is-grabbed');
    updateGlassyFromPointer(e);
    if (nav.releasePointerCapture) {
        nav.releasePointerCapture(e.pointerId);
    }

    // Treat as tap if there was no significant drag
    if (dragDistance < 6) {
        const tappedItem =
            e.target.closest?.('.nav-links li') ||
            document.elementFromPoint(e.clientX, e.clientY)?.closest('.nav-links li');

        if (tappedItem) {
            velocity = 0;
            snapToItem(tappedItem, true);
            return;
        }
    }
    
    // CALCULATE THROW
    // Project where the slider would land based on velocity
    // "Momentum factor" - higher number = throw further
    const momentumFactor = physicsConfig.momentumMs;
    let projectedX = currentSliderLeft + (slider.offsetWidth / 2) + (velocity * momentumFactor);
    
    // Clamp projection to bounds
    if (projectedX < 0) projectedX = 0;
    if (projectedX > nav.offsetWidth) projectedX = nav.offsetWidth;
    
    // Find item closest to the THROW destination, not just current position
    const closest = findClosestItem(projectedX);
    if (closest) {
        const { left } = measureItem(closest);
        motion.vel = velocity * 16.6667 * 0.9;
        motion.target = left;
        startAnimation();
        snapToItem(closest, true);
    }
});

listItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Prevent accidental clicks during drag
        if (!isDragging) snapToItem(item, true);
    });
});

window.addEventListener('resize', init);
window.addEventListener('load', init);