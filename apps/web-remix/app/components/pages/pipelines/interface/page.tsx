import { MetaFunction } from "@remix-run/node";

export function InterfacePage() {
  return <h1>Interface</h1>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Interface",
    },
  ];
};
