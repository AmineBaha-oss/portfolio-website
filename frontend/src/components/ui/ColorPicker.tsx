"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ColorPicker.module.scss";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  { name: "Cream", value: "#EAE2D6" },
  { name: "Slate", value: "#6B7B8C" },
  { name: "Charcoal", value: "#2A2A2A" },
  { name: "Warm Gray", value: "#8B8578" },
  { name: "Sage", value: "#9CAF88" },
  { name: "Dusty Blue", value: "#7B9AAF" },
  { name: "Terracotta", value: "#C17D60" },
  { name: "Lavender", value: "#6B5B7A" },
  { name: "Forest", value: "#4A5D4A" },
  { name: "Navy", value: "#2C3E50" },
  { name: "Burgundy", value: "#722F37" },
  { name: "Teal", value: "#2E8B8B" },
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hexInput, setHexInput] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nativePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHexInput(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setHexInput(color);
    setShowDropdown(false);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexInput(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleHexBlur = () => {
    let fixed = hexInput.trim();
    if (!fixed.startsWith("#")) {
      fixed = "#" + fixed;
    }
    if (/^#[0-9A-Fa-f]{3}$/.test(fixed)) {
      fixed = `#${fixed[1]}${fixed[1]}${fixed[2]}${fixed[2]}${fixed[3]}${fixed[3]}`;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(fixed)) {
      onChange(fixed);
      setHexInput(fixed);
    } else {
      setHexInput(value || "");
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onChange(newColor);
    setHexInput(newColor);
    setShowDropdown(false);
  };

  const getSelectedColorName = () => {
    const preset = PRESET_COLORS.find((p) => p.value.toUpperCase() === value?.toUpperCase());
    return preset?.name || null;
  };

  return (
    <div className={styles.colorPickerContainer} ref={dropdownRef}>
      {label && <label className={styles.label}>{label}</label>}

      <button
        type="button"
        className={styles.selectButton}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div
          className={styles.colorPreview}
          style={{ backgroundColor: value || "#333" }}
        />
        <span className={styles.colorName}>
          {getSelectedColorName() || hexInput || "Select color"}
        </span>
        <span className={styles.chevron}>{showDropdown ? "▲" : "▼"}</span>
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`${styles.presetItem} ${value?.toUpperCase() === preset.value.toUpperCase() ? styles.selected : ""}`}
              onClick={() => handlePresetClick(preset.value)}
              title={preset.name}
            >
              <div
                className={styles.presetSwatch}
                style={{ backgroundColor: preset.value }}
              />
              <span className={styles.presetName}>{preset.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.customSection}>
        <input
          type="text"
          className={styles.hexInput}
          value={hexInput}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          placeholder="#RRGGBB"
          maxLength={7}
        />
        <button
          type="button"
          className={styles.pickerButton}
          onClick={() => nativePickerRef.current?.click()}
        >
          Pick
        </button>
      </div>

      <input
        ref={nativePickerRef}
        type="color"
        className={styles.nativeColorPicker}
        value={value || "#FFFFFF"}
        onChange={handleNativePickerChange}
      />
    </div>
  );
}
