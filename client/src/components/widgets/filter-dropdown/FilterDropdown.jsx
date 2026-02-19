import { useState, useRef, useEffect } from "react";
import "./FilterDropdown.css";

/**
 * A modern, reusable filter dropdown component.
 *
 * Props:
 *   label    – placeholder text when nothing is selected
 *   options  – array of string options
 *   value    – currently selected value (empty string = "All")
 *   onChange – callback fired with the new value
 */
const FilterDropdown = ({ label, options = [], value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    const displayValue = value || null;

    return (
        <div className="filter-dropdown">
            {/* Trigger button */}
            <button
                ref={triggerRef}
                className={`filter-dropdown__trigger ${isOpen ? "filter-dropdown__trigger--open" : ""}`}
                onClick={() => setIsOpen((o) => !o)}
                type="button"
            >
                {displayValue ? (
                    <span className="filter-dropdown__value">{displayValue}</span>
                ) : (
                    <span className="filter-dropdown__label">{label}</span>
                )}

                {/* Chevron SVG */}
                <svg
                    className={`filter-dropdown__chevron ${isOpen ? "filter-dropdown__chevron--open" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Backdrop */}
            {isOpen && <div className="filter-dropdown__backdrop" onClick={() => setIsOpen(false)} />}

            {/* Menu */}
            {isOpen && (
                <div className="filter-dropdown__menu">
                    {/* "All" option */}
                    <button
                        className={`filter-dropdown__item ${value === "" ? "filter-dropdown__item--active" : ""}`}
                        onClick={() => handleSelect("")}
                        type="button"
                    >
                        <em>All</em>
                    </button>

                    {/* Options */}
                    {options.map((option) => (
                        <button
                            key={option}
                            className={`filter-dropdown__item ${value === option ? "filter-dropdown__item--active" : ""}`}
                            onClick={() => handleSelect(option)}
                            type="button"
                        >
                            <svg
                                className={`filter-dropdown__check ${value === option ? "filter-dropdown__check--visible" : ""}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
