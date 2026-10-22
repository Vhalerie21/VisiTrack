// BACKEND: update when the real API is ready
// Keep the endpoint, payload, and response mapping in this section only.

const API_BASE_URL = "https://api.example.com";
const CHECK_IN_ENDPOINT = "/check-ins";
const USE_MOCK = true;

const MOCK_RESULTS = {
  "AB-0000-0000": { ok: true },
  "AB-1111-1111": { ok: false, error: "NOT_FOUND" },
  "AB-2222-2222": { ok: false, error: "DUPLICATE" },
  "AB-3333-3333": { ok: false, error: "NETWORK" },
};

const VALID_REFERENCE = /^[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const BACKEND_ERRORS = new Set([
  "NOT_FOUND",
  "DUPLICATE",
  "NETWORK",
  "INVALID",
]);

export async function submitCheckIn(referenceNumber, gate = null) {
  if (!VALID_REFERENCE.test(referenceNumber)) {
    return {
      ok: false,
      error: "INVALID",
    };
  }

  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 450));

    return (
      MOCK_RESULTS[referenceNumber] || {
        ok: false,
        error: "INVALID",
      }
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}${CHECK_IN_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceNumber,
        ...(gate ? { gate } : {}),
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: "NOT_FOUND" };
      }

      if (response.status === 409) {
        return { ok: false, error: "DUPLICATE" };
      }

      return { ok: false, error: "NETWORK" };
    }

    const data = await response.json();

    if (data.ok === true) {
      return { ok: true };
    }

    return {
      ok: false,
      error: BACKEND_ERRORS.has(data.error) ? data.error : "NETWORK",
    };
  } catch {
    return {
      ok: false,
      error: "NETWORK",
    };
  }
}
