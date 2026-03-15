const MAX_LIMIT = 100;

export function toBoundedLimit(value, defaultLimit = 10) {
  const parsed = Number.parseInt(String(value ?? defaultLimit), 10);
  if (Number.isNaN(parsed)) return defaultLimit;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

export function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8"),
    );

    if (!decoded?.createdAt || !decoded?._id) return null;

    const createdAt = new Date(decoded.createdAt);
    if (Number.isNaN(createdAt.getTime())) return null;

    return {
      createdAt,
      _id: decoded._id,
    };
  } catch {
    return null;
  }
}
