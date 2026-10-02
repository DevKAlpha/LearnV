const QA_STUDY_ROUTES = [
  /^\/study$/,
  /^\/study\/(english|korean|interviews|written-simulator)$/,
  /^\/tests\/(en|ko)$/,
  /^\/tests\/(en|ko)\/[^/]+$/,
];

function normalizePathname(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

export function isQaLearningRoute(pathname: string) {
  const normalized = normalizePathname(pathname);
  return normalized === "/" || QA_STUDY_ROUTES.some((route) => route.test(normalized));
}

export function resolveQaLearningRoute(pathname: string) {
  return isQaLearningRoute(pathname) ? normalizePathname(pathname) : "/study";
}
