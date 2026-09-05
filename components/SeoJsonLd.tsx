type StructuredData = Record<string, unknown>;

export function SeoJsonLd({ data }: { data: StructuredData | StructuredData[] }) {
  // Emit individual documents so consumers can read @context at the root.
  const documents = Array.isArray(data) ? data : [data];
  return <>{documents.map((document, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(document).replace(/</g, '\\u003c'),
      }}
    />
  ))}</>;
}
