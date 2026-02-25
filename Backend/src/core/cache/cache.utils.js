export function buildTenantKey(baseKey, tenant) {
  const franchise = tenant?.franchiseId || "global";
  const outlet = tenant?.outletId || "global";

  return `tenant:${franchise}:${outlet}:${baseKey}`;
}