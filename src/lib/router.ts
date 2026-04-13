export function createRouter() {
  return {
    on(path: string) {
      return {
        render() {},
        handle() {},
      };
    },

    group(path: string, cb: Function) {},
  };
}
