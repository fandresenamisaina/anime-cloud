import { Request } from "express";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      isAdmin?: boolean;
      body: any;
      params: any;
      query: any;
      headers: any;
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] };
    }
    
    interface Multer {}
  }
}

export {};
