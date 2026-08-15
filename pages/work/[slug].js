import Head from "next/head";
import CaseStudyPage from "../../components/CaseStudy/CaseStudyPage";
import { siteContent } from "../../data/content.mjs";

export default function WorkCaseStudy({ slug }) {
  return (
    <>
      <Head>
        <title>Project case study | Zhicheng Situ</title>
        <meta name="description" content="Selected project case study by Zhicheng Situ." />
      </Head>
      <CaseStudyPage slug={slug} />
    </>
  );
}

export function getStaticPaths() {
  const projects = siteContent.en.selectedProjects || [];

  return {
    paths: projects.map((project) => ({ params: { slug: project.id } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const projects = siteContent.en.selectedProjects || [];
  const projectExists = projects.some((project) => project.id === params?.slug);

  if (!projectExists) return { notFound: true };

  return { props: { slug: params.slug } };
}
