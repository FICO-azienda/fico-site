import Loader from "@/components/Loader";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Navigation from "@/components/Navigation";
import FilmExperience from "@/components/FilmExperience";
import Studio from "@/components/Studio";
import Services from "@/components/Services";
import Approach from "@/components/Approach";
import Worlds from "@/components/Worlds";
import WhyFico from "@/components/WhyFico";
import ClosingCta from "@/components/ClosingCta";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Loader />
      <Cursor />
      <Navigation />
      <main id="top">
        <h1 className="sr-only">FICO — websites for a brighter tomorrow</h1>
        <FilmExperience />
        <Studio />
        <Services />
        <Approach />
        <Worlds />
        <WhyFico />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
