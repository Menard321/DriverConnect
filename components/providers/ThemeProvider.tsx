"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AppearanceConfig {
  themeAccent: "amber" | "emerald" | "blue" | "rose";
  cornerRadius: "sharp" | "rounded" | "pill";
  layoutDensity: "compact" | "classic" | "spacious";
  showTestimonials: boolean;
  backgroundImageUrl: string;
  deliveryRatePerKm?: number;
  driverDailyRate?: number;
  saleReservationFee?: number;
}

export const defaultAppearance: AppearanceConfig = {
  themeAccent: "amber",
  cornerRadius: "rounded",
  layoutDensity: "classic",
  showTestimonials: true,
  backgroundImageUrl: "/images/hero-workshop-bg.jpg",
  deliveryRatePerKm: 3500,
  driverDailyRate: 50000,
  saleReservationFee: 1300000,
};

interface ThemeContextType {
  appearance: AppearanceConfig;
  setAppearance: React.Dispatch<React.SetStateAction<AppearanceConfig>>;
  // Convenience shortcuts and persistent handlers
  theme: "amber" | "emerald" | "blue" | "rose";
  setTheme: (theme: "amber" | "emerald" | "blue" | "rose") => void;
  cornerRadius: "sharp" | "rounded" | "pill";
  setCornerRadius: (radius: "sharp" | "rounded" | "pill") => void;
  layoutDensity: "compact" | "classic" | "spacious";
  setLayoutDensity: (density: "compact" | "classic" | "spacious") => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
  updateAppearance: (partial: Partial<AppearanceConfig>) => Promise<void>;
  refreshWallet: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  appearance: defaultAppearance,
  setAppearance: () => {},
  theme: "amber",
  setTheme: () => {},
  cornerRadius: "rounded",
  setCornerRadius: () => {},
  layoutDensity: "classic",
  setLayoutDensity: () => {},
  isDark: true,
  setIsDark: () => {},
  walletBalance: 350000,
  setWalletBalance: () => {},
  updateAppearance: async () => {},
  refreshWallet: () => {},
});

export function ThemeProvider({
  children,
  initialAppearance,
}: {
  children: React.ReactNode;
  initialAppearance?: Partial<AppearanceConfig>;
}) {
  const [appearance, setAppearance] = useState<AppearanceConfig>({
    ...defaultAppearance,
    ...initialAppearance,
  });

  const [isDark, setIsDark] = useState<boolean>(true);
  const [walletBalance, setWalletBalance] = useState<number>(350000); // Demo TZS wallet balance

  // Load initial appearance from API/Supabase on mount
  useEffect(() => {
    async function loadAppearance() {
      try {
        const res = await fetch("/api/appearance");
        if (res.ok) {
          const data = await res.json();
          if (data && (data.themeAccent || data.theme_accent)) {
            setAppearance((prev) => ({
              ...prev,
              themeAccent: (data.themeAccent || data.theme_accent) as any,
              cornerRadius: (data.cornerRadius || data.corner_radius) as any,
              layoutDensity: (data.layoutDensity || data.layout_density) as any,
              showTestimonials: data.showTestimonials ?? data.show_testimonials ?? true,
              backgroundImageUrl: data.backgroundImageUrl || data.background_image_url || prev.backgroundImageUrl,
              deliveryRatePerKm: data.deliveryRatePerKm || data.delivery_rate_per_km || prev.deliveryRatePerKm,
              driverDailyRate: data.driverDailyRate || data.driver_daily_rate || prev.driverDailyRate,
              saleReservationFee: data.saleReservationFee || data.sale_reservation_fee || prev.saleReservationFee,
            }));
          }
        }
      } catch (err) {
        console.warn("Using local appearance defaults:", err);
      }
    }
    loadAppearance();
  }, []);

  // Update CSS Variables & Root attributes dynamically on appearance changes
  useEffect(() => {
    const root = document.documentElement;

    // 1. Dynamic Radius mapping as requested
    const radiusMap = {
      sharp: "0px",
      rounded: "0.75rem",
      pill: "9999px",
    };
    root.style.setProperty("--app-radius", radiusMap[appearance.cornerRadius]);
    root.style.setProperty("--radius", radiusMap[appearance.cornerRadius]);

    // 2. Dynamic Color mapping as requested
    const colorMap = {
      amber: { primary: "#f59e0b", hover: "#d97706", light: "rgba(245, 158, 11, 0.15)" },
      emerald: { primary: "#10b981", hover: "#059669", light: "rgba(16, 185, 129, 0.15)" },
      blue: { primary: "#3b82f6", hover: "#2563eb", light: "rgba(59, 130, 246, 0.15)" },
      rose: { primary: "#f43f5e", hover: "#e11d48", light: "rgba(244, 63, 94, 0.15)" },
    };
    const activeColor = colorMap[appearance.themeAccent] || colorMap.amber;
    root.style.setProperty("--app-primary", activeColor.primary);
    root.style.setProperty("--app-primary-hover", activeColor.hover);
    root.style.setProperty("--app-primary-light", activeColor.light);

    // 3. Sync data attributes for Tailwind theme selectors
    root.setAttribute("data-theme", appearance.themeAccent);
    root.setAttribute("data-radius", appearance.cornerRadius);
    root.setAttribute("data-density", appearance.layoutDensity);

    // 4. Dark mode toggle
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [appearance, isDark]);

  const setTheme = (theme: "amber" | "emerald" | "blue" | "rose") => {
    setAppearance((prev) => ({ ...prev, themeAccent: theme }));
  };

  const setCornerRadius = (radius: "sharp" | "rounded" | "pill") => {
    setAppearance((prev) => ({ ...prev, cornerRadius: radius }));
  };

  const setLayoutDensity = (density: "compact" | "classic" | "spacious") => {
    setAppearance((prev) => ({ ...prev, layoutDensity: density }));
  };

  const updateAppearance = async (partial: Partial<AppearanceConfig>) => {
    const updated = { ...appearance, ...partial };
    setAppearance(updated);

    try {
      await fetch("/api/appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme_accent: updated.themeAccent,
          corner_radius: updated.cornerRadius,
          layout_density: updated.layoutDensity,
          show_testimonials: updated.showTestimonials,
          background_image_url: updated.backgroundImageUrl,
          delivery_rate_per_km: updated.deliveryRatePerKm,
          driver_daily_rate: updated.driverDailyRate,
          sale_reservation_fee: updated.saleReservationFee,
        }),
      });
    } catch (err) {
      console.error("Failed to persist appearance to Supabase:", err);
    }
  };

  const refreshWallet = () => {
    const stored = localStorage.getItem("dc_wallet_balance");
    if (stored) {
      setWalletBalance(parseFloat(stored));
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        setAppearance,
        theme: appearance.themeAccent,
        setTheme,
        cornerRadius: appearance.cornerRadius,
        setCornerRadius,
        layoutDensity: appearance.layoutDensity,
        setLayoutDensity,
        isDark,
        setIsDark,
        walletBalance,
        setWalletBalance,
        updateAppearance,
        refreshWallet,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
