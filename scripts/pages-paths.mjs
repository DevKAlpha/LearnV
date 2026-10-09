export function pagesBase({ actions, repository = "DevKAlpha/LearnV", owner = "DevKAlpha", scope = "full", override } = {}) {
  if (override) {
    if (!/^\/(?:[\w-]+\/)*$/.test(override)) throw new Error("VITE_BASE_PATH must be an absolute directory path");
    return override;
  }
  if (!actions) return "/";
  const name = repository.split("/")[1];
  const root = name?.toLowerCase() === `${owner}.github.io`.toLowerCase() ? "/" : `/${name}/`;
  return scope === "learning-qa" ? `${root}qa/` : root;
}

// Executed in the root 404 before production's bootstrap or bundles can run.
export function qaRedirectScript(base) {
  const qaBase = `${base}qa/`;
  return `<script data-learnv-qa-redirect>(()=>{const base=${JSON.stringify(qaBase)};if(location.pathname===base.slice(0,-1)||location.pathname.startsWith(base)){location.replace(base+"?learnv-route="+encodeURIComponent(location.pathname+location.search+location.hash));}})();</script>`;
}
