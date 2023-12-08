import {config} from './config/config';

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-provider-ini'); // Import credential provider

const credentials = fromIni({
  // Specify a profile if using a named profile from ~/.aws/credentials
  // profile: 'YOUR_PROFILE_NAME'
});

const s3Client = new S3Client({
  region: config.aws_region,
  credentials // Pass the credentials to the client
});

const params = {
  Bucket: config.aws_media_bucket
};

// Generates an AWS signed URL for retrieving objects
export function getGetSignedUrl( key: string ): string {
  const signedUrlExpireSeconds = 60 * 5;
  const getObjectCommand = new GetObjectCommand(params);

  return s3Client.getSignedUrl(getObjectCommand);
}


// Generates an AWS signed URL for uploading objects
export function getPutSignedUrl( key: string ): string {
  const signedUrlExpireSeconds = 60 * 5;

  const putObjectCommand = new PutObjectCommand(params);
  return s3Client.getSignedUrl(putObjectCommand);
}
