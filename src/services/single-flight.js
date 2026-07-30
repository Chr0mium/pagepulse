const inFlight = new Map();

export async function singleFlight(key, operation) {
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = operation();

  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}