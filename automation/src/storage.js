import { google } from "googleapis";
import { Readable } from "node:stream";
import { ENV } from "./env.js";

let cachedClient = null;

function getDriveClient() {
  if (cachedClient) return cachedClient;
  const oauth2Client = new google.auth.OAuth2(ENV.googleClientId, ENV.googleClientSecret);
  oauth2Client.setCredentials({ refresh_token: ENV.googleRefreshToken });
  cachedClient = google.drive({ version: "v3", auth: oauth2Client });
  return cachedClient;
}

const folderIdCache = new Map();

async function ensureFolderPath(drive, segments) {
  let parentId = ENV.googleDriveFolderId;
  let pathKey = "";
  for (const segment of segments) {
    pathKey += `/${segment}`;
    if (folderIdCache.has(pathKey)) {
      parentId = folderIdCache.get(pathKey);
      continue;
    }
    const existing = await drive.files.list({
      q: `'${parentId}' in parents and name='${segment}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id)",
    });
    let folderId = existing.data.files?.[0]?.id;
    if (!folderId) {
      const created = await drive.files.create({
        requestBody: { name: segment, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
        fields: "id",
      });
      folderId = created.data.id;
    }
    folderIdCache.set(pathKey, folderId);
    parentId = folderId;
  }
  return parentId;
}

export async function uploadToR2(key, buffer, contentType) {
  const drive = getDriveClient();
  const segments = key.split("/").filter(Boolean);
  const filename = segments.pop();
  const parentId = await ensureFolderPath(drive, segments);

  const uploaded = await drive.files.create({
    requestBody: { name: filename, parents: [parentId] },
    media: { mimeType: contentType, body: Readable.from(buffer) },
    fields: "id",
  });
  const fileId = uploaded.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return contentType === "application/pdf"
    ? `https://drive.google.com/uc?export=download&id=${fileId}`
    : `https://drive.google.com/uc?export=view&id=${fileId}`;
}
