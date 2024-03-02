var AWS = require('aws-sdk');
var uuidv4 = require('uuid').v4;

const IMAGE_SERVICE_BASE_URL='https://media.diagramly.ai';
const CF_R2_BUCKET_NAME='media-diagramly-ai';

var s3 = new AWS.S3({
  region: 'us-east-1',
  accessKeyId: process.env.CF_R2_ACCESS_KEY,
  secretAccessKey: process.env.CF_R2_SECRET_KEY,
  endpoint: 'https://8d5fc7ce04adc5096f52485cce7d7b3d.r2.cloudflarestorage.com'
});

export const uploadToS3 = async ({ name, type, buffer }) => {
    try {
      if (!name || !type || !buffer) {
        throw new Error('Invalid file data');
      }
  
      // Generate a unique ID and append the file extension
      const uniqueName = `${uuidv4()}${name.substring(name.lastIndexOf('.'))}`;
  
      const params = {
        Bucket: CF_R2_BUCKET_NAME,
        Key: uniqueName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: type,
      };
  
      // Upload the file to S3
      await s3.putObject(params).promise();
  
      // Build the public URL of the uploaded file
      const imageUrl = `${IMAGE_SERVICE_BASE_URL}/${uniqueName}`;
      console.log(`File uploaded successfully: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error; // Rethrow the error after logging it
    }
  };