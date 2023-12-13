import {config} from './config/config';

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { fromIni } = require('@aws-sdk/credential-provider-ini'); // Import credential provider

const credentials = fromIni({
  // Specify a profile if using a named profile from ~/.aws/credentials
  // profile: 'YOUR_PROFILE_NAME'
});

const s3Client = new S3Client({
  region: config.aws_region,
  credentials // Pass the credentials to the client
});

let params = {
  Bucket: config.aws_media_bucket,
  Key: ''
};

// Generates an AWS signed URL for retrieving objects
export async function getGetSignedUrl( key: string ): Promise<string> {
  console.log('Get get signed url for image: '+ key);
  const signedUrlExpireSeconds = 60 * 5;
  params.Key = key;
  const getObjectCommand = new GetObjectCommand(params);
  const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: signedUrlExpireSeconds });
  return url;
}


// Generates an AWS signed URL for uploading objects
export async function getPutSignedUrl( key: string ): Promise<string> {
  console.log('Get put signed url for: '+ key);
  const signedUrlExpireSeconds = 60 * 5;
  params.Key = key;
  const putObjectCommand = new PutObjectCommand(params);
  const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: signedUrlExpireSeconds });
  return url;
}
