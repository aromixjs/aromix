export type RenderFunction = () => string | Promise<string>;

export interface RouterRoute {
  path: string;
  render: RenderFunction;
}

export interface Router {
  routes: RouterRoute[];
  on(path: string, render: RenderFunction): void;
}

export function createRouter(): Router {
  const routes: RouterRoute[] = [];

  return {
    routes,
    on(path: string, render: RenderFunction) {
      routes.push({ path, render });
    },
  };
}