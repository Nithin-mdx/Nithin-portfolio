import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/portfolio";
import ProjectView from "@/components/ProjectView";
import Footer from "@/components/Footer";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.tagline } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  return (
    <>
      <ProjectView project={projects[i]} next={projects[i + 1]} />
      <Footer />
    </>
  );
}
