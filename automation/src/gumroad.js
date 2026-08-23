import { ENV } from "./env.js";

const API = "https://api.gumroad.com/v2";

async function createProduct({ name, description, priceCents, tags }) {
  const response = await fetch(`${API}/products`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.gumroadAccessToken}`,
    },
    body: JSON.stringify({ name, description, price: priceCents, tags: tags.join(",") }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(`Gumroad create-product failed: ${data.message || response.status}`);
  }
  return data.product;
}

async function attemptFileAttach(productId, pdfBuffer, filename) {
  const form = new FormData();
  form.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), filename);
  const response = await fetch(`${API}/products/${productId}`, {
    method: "PUT",
    headers: { authorization: `Bearer ${ENV.gumroadAccessToken}` },
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(`Gumroad file attach failed or is unsupported: ${data.message || response.status}`);
  }
  return true;
}

export async function publishToGumroad({ title, description, priceCents, tags, pdfBuffer, filename }) {
  if (!ENV.gumroadAccessToken) {
    return { status: "not_started", note: "GUMROAD_ACCESS_TOKEN not set." };
  }
  try {
    const product = await createProduct({ name: title, description, priceCents, tags });
    try {
      await attemptFileAttach(product.id, pdfBuffer, filename);
      return { status: "published", productId: product.id, url: product.short_url };
    } catch (attachError) {
      return {
        status: "needs_login",
        productId: product.id,
        url: product.short_url,
        note: `Listing created as a draft, but automatic file upload didn't work (${attachError.message}). Upload manually then publish.`,
      };
    }
  } catch (error) {
    return { status: "failed", note: error.message };
  }
}
