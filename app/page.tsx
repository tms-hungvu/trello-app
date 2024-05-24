import type { Metadata } from "next";
import { Counter } from "./components/Trello/Index";

export default function IndexPage() {
  return <Counter />;
}

export const metadata: Metadata = {
  title: "Redux Toolkit",
};
