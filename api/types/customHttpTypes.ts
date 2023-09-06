import AppError from '../common/AppError';


export type ReqBodyType = { [key: string]: any } | FormData;
export interface CustomRequest {
  body: ReqBodyType;
  // add any other fields you commonly use
}

export type ResBodyType = { [key: string]: any } | string;
export interface CustomResponse {
  json: (body: ResBodyType) => void;
  status: (code: number) => CustomResponse;
  // add any other methods you commonly use
}

export type CustomNextFunction = (error?: AppError) => void;
