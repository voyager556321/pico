import { AppChrome } from "@/components/app/AppChrome";
import { AppLanguageProvider } from "@/components/app/AppLanguage";
import { SolanaProvider } from "@/adapters/solana/SolanaProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <AppLanguageProvider>
        <AppChrome>{children}</AppChrome>
      </AppLanguageProvider>
    </SolanaProvider>
  );
}
