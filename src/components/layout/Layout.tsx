import { type PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="bg-[url(/backgrounds/light-bg.webp)] dark:bg-[url(/backgrounds/dark-bg.webp)] bg-cover bg-center bg-no-repeat max-w-lg bg-secondary mx-auto h-dvh overflow-hidden">
      {children}
    </div>
  );
}