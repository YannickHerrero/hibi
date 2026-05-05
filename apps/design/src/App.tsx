import { Masthead } from "./components/Masthead.tsx";
import { ThemeBar } from "./components/ThemeBar.tsx";
import { ButtonsSection } from "./components/sections/Buttons.tsx";
import { ColorsSection } from "./components/sections/Colors.tsx";
import { FieldsSection } from "./components/sections/Fields.tsx";
import { HibiExtensionsSection } from "./components/sections/HibiExtensions.tsx";
import { TypographySection } from "./components/sections/Typography.tsx";
import { useTheme } from "./lib/theme.ts";

export function App() {
  const [theme, setTheme] = useTheme();
  return (
    <>
      <ThemeBar theme={theme} onChange={setTheme} />
      <Masthead />
      <main className="page">
        <TypographySection />
        <div className="rule" />
        <ColorsSection />
        <div className="rule" />
        <ButtonsSection />
        <div className="rule" />
        <FieldsSection />
        <div className="rule" />
        <HibiExtensionsSection />
      </main>
    </>
  );
}
