import { AppChrome } from "@/components/app/AppChrome";
import { SolanaProvider } from "@/adapters/solana/SolanaProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <AppChrome>{children}</AppChrome>
    </SolanaProvider>
  );
}
