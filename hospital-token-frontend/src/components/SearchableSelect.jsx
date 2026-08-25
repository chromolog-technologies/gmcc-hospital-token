import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * SearchableSelect — editable text input with filtered dropdown.
 *
 * Props:
 *   options      : [{ value, label }]
 *   value        : currently selected value (id/string)
 *   onChange     : (value) => void   — called with the option's value on select
 *   placeholder  : string
 *   required     : bool
 */
const SearchableSelect = ({ options = [], value, onChange, placeholder = 'Search…', required = false }) => {
    const [query,    setQuery]    = useState('');
    const [open,     setOpen]     = useState(false);
    const [focused,  setFocused]  = useState(-1);
    const containerRef            = useRef(null);
    const inputRef                = useRef(null);
    const listRef                 = useRef(null);

    // Display label of the currently selected value
    const selectedLabel = options.find(o => String(o.value) === String(value))?.label ?? '';

    // Filtered list
    const filtered = query.trim() === ''
        ? options
        : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
                setFocused(-1);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Scroll focused item into view
    useEffect(() => {
        if (focused >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-option]');
            items[focused]?.scrollIntoView({ block: 'nearest' });
        }
    }, [focused]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setOpen(true);
        setFocused(-1);
    };

    const handleSelect = (option) => {
        onChange(option.value);
        setOpen(false);
        setQuery('');
        setFocused(-1);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setQuery('');
        setOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setOpen(true);
            return;
        }
        if (e.key === 'ArrowDown') {
            setFocused(f => Math.min(f + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            setFocused(f => Math.max(f - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focused >= 0 && filtered[focused]) handleSelect(filtered[focused]);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {/* Input */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: open ? '1.5px solid #ff0088' : '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    transition: 'border-color 0.15s',
                    overflow: 'hidden',
                }}
                onClick={() => { setOpen(true); inputRef.current?.focus(); }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    required={required && !value}
                    value={open ? query : (query || selectedLabel)}
                    onChange={handleInputChange}
                    onFocus={() => { setOpen(true); setQuery(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedLabel || placeholder}
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        color: '#0f172a',
                        background: 'transparent',
                        minWidth: 0,
                    }}
                />
                {value ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', color: '#94a3b8', display: 'flex' }}
                    >
                        <X size={14} />
                    </button>
                ) : (
                    <span style={{ padding: '0 0.5rem', color: '#94a3b8', display: 'flex' }}>
                        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div
                    ref={listRef}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 999,
                    }}
                >
                    {filtered.length === 0 ? (
                        <div style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                            No results found
                        </div>
                    ) : (
                        filtered.map((option, idx) => (
                            <div
                                key={option.value}
                                data-option
                                onMouseDown={() => handleSelect(option)}
                                style={{
                                    padding: '0.6rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: String(option.value) === String(value) ? '#ff0088' : '#0f172a',
                                    background: idx === focused
                                        ? '#fff5fa'
                                        : String(option.value) === String(value)
                                            ? '#fff0f8'
                                            : 'white',
                                    fontWeight: String(option.value) === String(value) ? 700 : 400,
                                    borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={() => setFocused(idx)}
                            >
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
