// generate-key.js
import forge from "node-forge";
import fs from "fs";

const keypair = forge.pki.rsa.generateKeyPair(2048);

// 공개키 (manifest.json용)
const publicKeyDer = forge.asn1
  .toDer(forge.pki.publicKeyToAsn1(keypair.publicKey))
  .getBytes();
const publicKeyBase64 = Buffer.from(publicKeyDer, "binary").toString("base64");

// 파일로 저장
fs.writeFileSync("public-key.txt", publicKeyBase64);

console.log("✅ manifest.json에 넣을 key:");
console.log(publicKeyBase64);
