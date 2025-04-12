import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import BannerSlider from "@/components/BannerSlider";
import BlogSection from "@/components/BlogSection";
import { getActiveBanners, getLatestBlogs } from "@/sanity/helpers/queries";

export default async function Home() {
  const banners = await getActiveBanners();
  const blogs = await getLatestBlogs();

  return (
    <div>
      <Container className="py-10">
        <BannerSlider banners={banners} />
        <div className="mt-16">
          <HomeBanner />
          <ProductGrid />
        </div>
        <BlogSection blogs={blogs} />
      </Container>
    </div>
  );
}