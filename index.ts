import express, { Request, Response, NextFunction } from "express";
import multer, { MemoryStorage, FileFilterCallback } from "multer";
import { s3Uploadv3 } from "./s3Service";
import { v4 as uuid } from "uuid";

require( "dotenv" ).config();

const app = express();
const port = 4000;

const storage: MemoryStorage = multer.memoryStorage();

const fileFilter = ( req: Request, file: Express.Multer.File, cb: FileFilterCallback ) => {
  if ( file.mimetype.split( "/" )[ 0 ] === "image" ) {
    cb( null, true );
  } else {
    cb( new multer.MulterError( "LIMIT_UNEXPECTED_FILE" ), false );
  }
};

const upload = multer( {
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 2 },
} );

app.post( "/upload", upload.array( "file" ), async ( req: Request, res: Response ) => {
  try {
    const results = await s3Uploadv3( req.files as Express.Multer.File[] );
    console.log( results );
    return res.json( { status: "success" } );
  } catch ( err ) {
    console.error( err );
    return res.status( 500 ).json( { message: "Internal Server Error" } );
  }
} );

app.use( ( error: any, req: Request, res: Response, next: NextFunction ) => {
  if ( error instanceof multer.MulterError ) {
    if ( error.code === "LIMIT_FILE_SIZE" ) {
      return res.status( 400 ).json( { message: "File is too large" } );
    }

    if ( error.code === "LIMIT_FILE_COUNT" ) {
      return res.status( 400 ).json( { message: "File limit reached" } );
    }

    if ( error.code === "LIMIT_UNEXPECTED_FILE" ) {
      return res.status( 400 ).json( { message: "File must be an image" } );
    }
  }

  return next( error );
} );

app.listen( port, () => console.log( `Server is running on port ${ port }` ) );
