@props(['label', 'value', 'icon'])

<div class="stat-card reveal">
    <i class="{{ $icon }}"></i>
    <div class="stat-value">{{ $value }}</div>
    <div class="stat-label font-abel">{{ $label }}</div>
</div>
