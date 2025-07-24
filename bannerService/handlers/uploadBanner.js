//import s3 modules form aws-sdk
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.REGION,
});

exports.uploadBanner = async (event) => {
    try {
        //Extract bucket name
        const bucketName = process.env.BUCKET_NAME;

        //Parse the event body to get the file name and file type
        const { fileName, fileType } = JSON.parse(event.body);

        //Validate file name and type
        if (!fileName || !fileType) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    msg: "File name and type are required"
                })
            };
        }

        //Create parameters for the S3 PutObjectCommand
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: fileType,
        });

        //Generate a signed URL for the S3 PutObjectCommand
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

        //return the signed URL and file name
        //client will use this URL to upload the file directly to S3
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Signed URL generated successfully",
                signedUrl: signedUrl,
                fileName: fileName,
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "Error generating signed URL",
                error: error.message
            })
        };
    }
};