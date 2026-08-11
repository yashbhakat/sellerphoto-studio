import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const expectedFiles = ["README.txt", "index.html", "studio.css", "studio.js"];

function findEndOfCentralDirectory(archive) {
  const earliestOffset = Math.max(0, archive.length - 22 - 0xffff);
  for (let offset = archive.length - 22; offset >= earliestOffset; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("ZIP end-of-central-directory record was not found");
}

export function readZipEntries(archive) {
  const endOffset = findEndOfCentralDirectory(archive);
  const entryCount = archive.readUInt16LE(endOffset + 10);
  let offset = archive.readUInt32LE(endOffset + 16);
  const entries = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(archive.readUInt32LE(offset), 0x02014b50, "invalid ZIP central-directory entry");
    const flags = archive.readUInt16LE(offset + 8);
    const compression = archive.readUInt16LE(offset + 10);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const uncompressedSize = archive.readUInt32LE(offset + 24);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localHeaderOffset = archive.readUInt32LE(offset + 42);
    const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");

    assert.equal(flags & 1, 0, `${name} must not be encrypted`);
    assert.ok([0, 8].includes(compression), `${name} uses an unsupported ZIP compression method`);
    assert.ok(!entries.has(name), `${name} appears more than once in the release ZIP`);
    entries.set(name, { compression, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function extractEntry(archive, name, entry) {
  const offset = entry.localHeaderOffset;
  assert.equal(archive.readUInt32LE(offset), 0x04034b50, `${name} has an invalid local ZIP header`);
  const nameLength = archive.readUInt16LE(offset + 26);
  const extraLength = archive.readUInt16LE(offset + 28);
  const dataOffset = offset + 30 + nameLength + extraLength;
  const compressed = archive.subarray(dataOffset, dataOffset + entry.compressedSize);
  const extracted = entry.compression === 0 ? compressed : inflateRawSync(compressed);
  assert.equal(extracted.length, entry.uncompressedSize, `${name} extracted to the wrong size`);
  return extracted;
}

export async function verifyReleaseArchive({
  archivePath = join(projectRoot, "releases", "SellerPhotoStudio-v1.0.0.zip"),
  checksumPath = join(projectRoot, "releases", "SellerPhotoStudio-v1.0.0.sha256"),
  productDir = join(projectRoot, "product"),
} = {}) {
  const [archive, checksumManifest] = await Promise.all([
    readFile(archivePath),
    readFile(checksumPath, "utf8"),
  ]);
  const sha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();
  const expectedSha256 = checksumManifest.trim().split(/\s+/)[0]?.toUpperCase();
  assert.equal(sha256, expectedSha256, "release ZIP does not match its SHA-256 manifest");

  const entries = readZipEntries(archive);
  assert.deepEqual([...entries.keys()].sort(), expectedFiles, "release ZIP contains an unexpected file set");

  for (const name of expectedFiles) {
    const source = await readFile(join(productDir, name));
    const packaged = extractEntry(archive, name, entries.get(name));
    assert.deepEqual(packaged, source, `${name} in the release ZIP is stale`);
  }

  return { sha256, files: expectedFiles };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await verifyReleaseArchive();
  console.log(`Verified SellerPhotoStudio-v1.0.0.zip (${result.files.length} files, SHA-256 ${result.sha256}).`);
}
