window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();

    // Apply per-viewer base colors once the model finishes loading.
    function srgbToLinear(value) {
        if (value <= 0.04045) {
            return value / 12.92;
        }
        return Math.pow((value + 0.055) / 1.055, 2.4);
    }

    function hexToLinearRgba(hex) {
        var clean = hex.trim();
        if (clean[0] === '#') {
            clean = clean.slice(1);
        }
        if (clean.length === 3) {
            clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        }
        if (clean.length !== 6) {
            return null;
        }
        var r = parseInt(clean.slice(0, 2), 16) / 255;
        var g = parseInt(clean.slice(2, 4), 16) / 255;
        var b = parseInt(clean.slice(4, 6), 16) / 255;
        return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b), 1];
    }

    function parseBaseColor(input) {
        if (!input) {
            return null;
        }
        var trimmed = input.trim();
        if (!trimmed) {
            return null;
        }
        if (trimmed[0] === '#' || /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(trimmed)) {
            return hexToLinearRgba(trimmed);
        }
        var cleaned = trimmed.replace(/[()]/g, '');
        var parts = cleaned.split(/[\s,]+/).filter(Boolean);
        if (parts.length < 3) {
            return null;
        }
        var r = parseFloat(parts[0]);
        var g = parseFloat(parts[1]);
        var b = parseFloat(parts[2]);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
            return null;
        }
        var max = Math.max(r, g, b);
        if (max > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }
        return [r, g, b, 1];
    }

    function applyBaseColor(viewer) {
        var hex = viewer.dataset.baseColor;
        if (!hex) {
            return;
        }
        var rgba = parseBaseColor(hex);
        if (!rgba || !viewer.model) {
            return;
        }
        viewer.model.materials.forEach(function(material) {
            if (material.pbrMetallicRoughness) {
                material.pbrMetallicRoughness.setBaseColorFactor(rgba);
                material.pbrMetallicRoughness.setMetallicFactor(0);
                material.pbrMetallicRoughness.setRoughnessFactor(1);
            }
        });
    }

    document.querySelectorAll('model-viewer[data-base-color]').forEach(function(viewer) {
        if (viewer.model) {
            applyBaseColor(viewer);
        } else {
            viewer.addEventListener('load', function() {
                applyBaseColor(viewer);
            }, { once: true });
        }
    });

})
