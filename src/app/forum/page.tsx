import { pageMetadata } from "@/lib/metadata";
import Forum from "@/components/Forum";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Forum — praathoek voor rijders & wandelaars · Apex Routes",
  description: "Deel routes, vergelijk navigatie-apps en toon foto's van je mooiste kilometers. Het Apex Forum werkt zonder account en gesprekken deel je via een link.",
  path: "/forum",
});

export default function ForumPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Forum", path: "/forum" }])) }}
      />
      <Forum />
    </>
  );
}
