import AgentLoop from "./AgentLoop";
import CTA from "./CTA";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar"
import ProblemSolution from "./ProblemSolution";
import Impact from "./Impact"

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <AgentLoop />
      <Features />
      <Impact />
      <CTA />
      <Footer />
    </div>
  );
}

export default LandingPage
