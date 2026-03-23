'use server'
import { S3Client, GetObjectCommand, ListBucketsCommand, type GetObjectRequest, type S3ClientConfig } from "@aws-sdk/client-s3"; // ES Modules import
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3ClientConfig : S3ClientConfig = {
 region: process.env.AWS_REGION, credentials:{
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
} }

const client = new S3Client(s3ClientConfig);


async function getPresignedUrl(s3Key: string) : Promise<string> {

  const getObjectRequest: GetObjectRequest = { // GetObjectRequest
  Bucket: process.env.S3_BUCKET_NAME!, // required
  Key: s3Key
}
const command = new GetObjectCommand(getObjectRequest);
const response = await client.send(command);
const url = await getSignedUrl(client, command, { expiresIn: 3600 });
return url
}

export {getPresignedUrl}
// consume or destroy the stream to free the socket.
// const bytes = await response.Body.transformToByteArray();
// const str = await response.Body.transformToString();