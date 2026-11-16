import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

// next/dynamic's server machinery isn't needed by the static browser build.
export default function dynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options?: { loading?: () => ReactNode },
) {
  const Component = lazy(loader);
  return function LazyComponent(props: P) {
    return <Suspense fallback={options?.loading?.() ?? null}><Component {...props}/></Suspense>;
  };
}
