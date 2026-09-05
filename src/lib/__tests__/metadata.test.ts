import test from "node:test";
import assert from "node:assert/strict";
import { pageMetadata } from "../metadata.ts";

test("metadata:canonical, Open Graph en Twitter delen dezelfde paginacopy", () => {
  const metadata = pageMetadata({
    title: "Testpagina · Apex Routes",
    description: "Een unieke testomschrijving.",
    path: "/test",
  });
  assert.equal(metadata.alternates && "canonical" in metadata.alternates ? metadata.alternates.canonical : null, "/test");
  assert.equal(metadata.openGraph?.title, "Testpagina · Apex Routes");
  assert.equal(metadata.openGraph?.description, "Een unieke testomschrijving.");
  assert.equal(metadata.twitter?.title, "Testpagina · Apex Routes");
  assert.deepEqual(metadata.twitter?.images, ["/og.jpg"]);
});
