import { AuthProvider } from "@/app/context/AuthContext";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata = {
    title: "NETSPACE",
    description: "Netspace Online Creator",
};

export default function RootLayout({ children }) {
    return (
        <html lang="tr">
            <body>
                <AuthProvider>
                    <header>
                        <Navbar />
                    </header>
                    <main>{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}
