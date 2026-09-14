// Isolated transport for existing service contracts. This is not a live backend test.
// The production local CMS is disabled; Firebase-specific tests use their own adapters.
export function createLegacyCmsFixture() {
  const collections = new Map();
  return async (input, options = {}) => {
    const name = new URL(String(input), 'http://localhost').pathname;
    const current = collections.get(name) ?? {records: [], revision: 0};
    if (options.method === 'PUT') {
      const next = JSON.parse(options.body);
      if (next.revision !== current.revision) return Response.json({error: 'Content changed in another tab. Refresh and try again.'}, {status: 409});
      const saved = {records: next.records, revision: current.revision + 1};
      collections.set(name, saved);
      return Response.json({revision: saved.revision});
    }
    return Response.json(current);
  };
}
