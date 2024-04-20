var AWS = require('aws-sdk');
var uuidv4 = require('uuid').v4;

const CF_R2_BUCKET_NAME='media-diagramly-ai';

var s3 = new AWS.S3({
  region: 'us-east-1',
  accessKeyId: process.env.CF_R2_ACCESS_KEY,
  secretAccessKey: process.env.CF_R2_SECRET_KEY,
  endpoint: 'https://8d5fc7ce04adc5096f52485cce7d7b3d.r2.cloudflarestorage.com'
});


const getKey = (name, clientDomain, userAccountId) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Adding 1 to make it 1-based
  const day = String(now.getUTCDate()).padStart(2, '0'); // Two-digit day

  // Generate a unique ID and append the file extension
  const uniqueName = `${uuidv4()}${name.substring(name.lastIndexOf('.'))}`;

  return `${year}/${month}/${day}/${clientDomain || 'unknown_client_domain'}/${userAccountId || 'unknown_user_account_id'}/${uniqueName}`;
}

export const uploadToS3 = async ({ name, type, buffer, clientDomain, userAccountId }) => {
    try {
      if (!name || !type || !buffer) {
        throw new Error('Invalid file data');
      }

      const key = getKey(name, clientDomain, userAccountId)
  
      const params = {
        Bucket: CF_R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: type,
      };
  
      // Upload the file to S3
      await s3.putObject(params).promise();
  
      console.log(`File uploaded successfully: ${key}`);
      
      return key;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error; // Rethrow the error after logging it
    }
  };