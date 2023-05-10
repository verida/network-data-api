import { Request, Response } from "express";
import { Version } from "./version.js";

export interface HealthCheck {
  /**
   * @summary A method that checks that this API Provider is working
   *
   * Implementations are free to perform whatever checks they need, but performance should
   * be considered. As a guideline, 2s is acceptable but 10s is not.
   *
   * @param address Address of the string whose Nonce is to be fetched.
   *
   * @returns any
   */
  checkHealth(): Promise<APIHealthResult>;
}

export interface APIHealthResult {
  working: boolean;
  message?: string;
}


export default class UtilsController {
  public constructor() {}

  /**
   * @summary Get Health API
   *
   * Check that all APIs appear to be reachable and running
   *
   * This is by no means a comprehensive test of the APIs we call.
   * We just want to be sure we can connect succesfully and get some basic data
   *
   * @type GET
   *
   * @param {Request} Express request
   * @param {Response} Express response
   *
   * @returns {Promise<Response<APIHealthResult>>}
   */
  public async getHealth(req: Request, res: Response): Promise<Response<APIHealthResult>> {
    return res.status(200).send({
      status: "success",
      data: {working: true},
    });
  }

  /**
   * @summary Get deployed version
   *
   * @type GET
   *
   * @param {Request} Express request
   * @param {Response} Express response
   *
   * @returns {Promise<SupportedTokenObject>}
   */
  public getVersion(req: Request, res: Response): Response {
    return res.status(200).send({
      status: "success",
      data: {
        version: Version.version,
        build_time_utc: Version.build_utc,
      },
    });
  }

}
