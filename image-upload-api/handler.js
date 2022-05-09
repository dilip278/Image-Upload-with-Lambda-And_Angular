'use strict';
const AWS = require('aws-sdk'); //call the aws module for accessing the aws utilities and s3 bucket
const s3 = new AWS.S3(); //create a new instance for s3 bucket
const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME; //get s3 bucket name from serverless.yml file

//below function defines the process of uploading the binary image to s3 bucket
module.exports.s3FileUploader = async (event) => {

  //create a response json for sending in response of the apis
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,Cache-Control,X-Requested-With",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ message: 'executed successfully!' }),
  };

  try {
    //parse the request body data in json format
    const parseBody = JSON.parse(event.body);
    //get the file data from body
    const base64File = parseBody.file;
    //decode the  file in base64 format
    const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
    //create object to verify the aws s3 bucket details and image/file name to be stored
    const params = {
      Bucket: BUCKET_NAME, //this define the S3 bucket name
      Key: `archive-graph/${parseBody.imagename}.png`, //this define the path of th image/file to be stored as well as file name and its extension
      Body: decodedFile, //this defines the content of the file/image
      contentType: "image/png", //this define the type of file
    };
    //below is the function which upload the file/image to the s3 bucket
    const uploadResult = await s3.upload(params).promise();
    //get the requested parameter from the body
    parseBody.UserId = parseBody.email;
    //get the image/file name from the s3 bucket details object
    parseBody.ImagesUrl = "<cloud front url which is linked to s3 bucket>" + `${parseBody.imagename}.png`;
    // await createArchiveGraphUrl(parseBody)
    response.body = JSON.stringify(uploadResult);
  } catch (e) {
    response.body = JSON.stringify({ message: e });
  }
  return response;
};
