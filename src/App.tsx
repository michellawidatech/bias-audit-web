import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stakes from "./components/Stakes";
import Approach from "./components/Approach";
import Pipeline from "./components/Pipeline";
import Model from "./components/Model";
import Reader from "./components/Reader";
import Rules from "./components/Rules";
import Findings from "./components/Findings";
import Audit from "./components/Audit";
import Frame from "./components/Frame";
import Finale from "./components/Finale";
import { useRevealRoot, useSmoothScroll } from "./hooks";

export default function App() {
  useSmoothScroll();
  useRevealRoot();

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Stakes />
        <hr className="rule" />
        <Approach />
        <hr className="rule" />
        <Pipeline />
        <hr className="rule" />
        <Model />
        <hr className="rule" />
        <Reader />
        <hr className="rule" />
        <Rules />
        <hr className="rule" />
        <Findings />
        <hr className="rule" />
        <Audit />
        <hr className="rule" />
        <Frame />
        <Finale />
      </main>
    </>
  );
}
