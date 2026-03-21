'use server'
import { S3Client, ListBucketsCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({ region: process.env.AWS_REGION, });

async function getS3Blob(bucket: string, key: string): Promise<Blob | undefined> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);

  // In the browser, 'Body' has a .blob() method
  return await response.Body?.blob(); 
}