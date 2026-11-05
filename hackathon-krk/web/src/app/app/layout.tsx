import { AppChrome } from "@/components/app/AppChrome";
import { AppLanguageProvider } from "@/components/app/AppLanguage";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLanguageProvider>
      <AppChrome>{children}</AppChrome>
    </AppLanguageProvider>
  );
}
