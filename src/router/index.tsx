import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/layout/AppLayout";
import HomeScreen from "@/screens/HomeScreen";
import MedicinesScreen from "@/screens/MedicinesScreen";
import WizardScreen from "@/screens/WizardScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useAppStore } from "@/stores/useAppStore";
import { HeaderProvider } from "@/contexts/HeaderProvider";
import SettingsScreen from "@/screens/SettingsScreen";

const SetupGuard = ({ children }: { children: React.ReactNode }) => {
    const isSetupComplete = useAppStore((state) => state.isSetupComplete);

    if (!isSetupComplete) {
        return <Navigate to="/wizard" replace />;
    }

    return <>{children}</>;
};

const ProtectedLayout = () => (
    <HeaderProvider>
        <Layout>
            <AppLayout>
                <Outlet />
            </AppLayout>
        </Layout>
    </HeaderProvider>
);

const router = createBrowserRouter([
    {
        path: "/wizard",
        element: (
            <Layout>
                <WizardScreen />
            </Layout>
        ),
    },
    {
        path: "/",
        element: (
            <SetupGuard>
                <ProtectedLayout />
            </SetupGuard>
        ),
        children: [
            { index: true, element: <HomeScreen /> },
            { path: "profile", element: <ProfileScreen /> },
            { path: "medicines", element: <MedicinesScreen /> },
            { path: "settings", element: <SettingsScreen /> },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}