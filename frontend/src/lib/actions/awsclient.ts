'use server'
import { S3Client, GetObjectCommand, type GetObjectRequest } from "@aws-sdk/client-s3"; // ES Modules import
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const config = {}; // type is S3ClientConfig
const client = new S3Client(config);
const input: GetObjectRequest = { // GetObjectRequest
  Bucket: process.env.AMZN_MUSIC_BUCKET, // required
  IfMatch: "STRING_VALUE",
  IfModifiedSince: new Date("TIMESTAMP"),
  IfNoneMatch: "STRING_VALUE",
  IfUnmodifiedSince: new Date("TIMESTAMP"),
  Key: "STRING_VALUE", // required
  Range: "STRING_VALUE",
  ResponseCacheControl: "STRING_VALUE",
  ResponseContentDisposition: "STRING_VALUE",
  ResponseContentEncoding: "STRING_VALUE",
  ResponseContentLanguage: "STRING_VALUE",
  ResponseContentType: "STRING_VALUE",
  ResponseExpires: new Date("TIMESTAMP"),
  VersionId: "STRING_VALUE",
  SSECustomerAlgorithm: "STRING_VALUE",
  SSECustomerKey: "STRING_VALUE",
  SSECustomerKeyMD5: "STRING_VALUE",
  RequestPayer: "requester",
  PartNumber: Number("int"),
  ExpectedBucketOwner: "STRING_VALUE",
  ChecksumMode: "ENABLED",
};
const command = new GetObjectCommand(input);
const response = await client.send(command);
const url = await getSignedUrl(client, command, { expiresIn: 3600 });
// consume or destroy the stream to free the socket.
// const bytes = await response.Body.transformToByteArray();
// const str = await response.Body.transformToString();