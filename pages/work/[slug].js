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

// Only projects with caseStudy: true get an on-site detail page; purely external projects stay link-out only.
const caseStudyProjects = (siteContent.en.selectedProjects || []).filter((project) => project.caseStudy === true);

export function getStaticPaths() {
  return {
    paths: caseStudyProjects.map((project) => ({ params: { slug: project.id } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const projectExists = caseStudyProjects.some((project) => project.id === params?.slug);

  if (!projectExists) return { notFound: true };

  return { props: { slug: params.slug } };
}
