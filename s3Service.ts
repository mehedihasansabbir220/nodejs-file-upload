import { S3 } from "aws-sdk";
import { S3Client, PutObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

interface FileUpload {
  originalname: string;
  buffer: Buffer;
}

export const s3Uploadv2 = async ( files: FileUpload[] ) => {
  const s3 = new S3();

  const uploadParams = files.map( ( file ) => ( {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `uploads/${ uuid() }-${ file.originalname }`,
    Body: file.buffer,
  } ) );

  return await Promise.all( uploadParams.map( ( param ) => s3.upload( param ).promise() ) );
};

export const s3Uploadv3 = async ( files: FileUpload[] ) => {
  const s3client = new S3Client( {} as S3ClientConfig );

  const uploadParams = files.map( ( file ) => ( {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `uploads/${ uuid() }-${ file.originalname }`,
    Body: file.buffer,
  } ) );

  return await Promise.all( uploadParams.map( ( param ) => s3client.send( new PutObjectCommand( param ) ) ) );
};
