export async function federatedLogout() {
  try {
    const response = await fetch("/api/auth/federated-logout");
    const data = await response.json();

    if (response.ok) {
      window.location.href = data.url;
    }
  } catch (_err) {
    window.location.href = "/";
  }
}
