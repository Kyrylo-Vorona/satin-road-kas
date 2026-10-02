/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateCategoryDto {
  name: string;
}

export interface CreateProductDto {
  name: string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  price?: number | string;
  description?: null | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  userId?: number | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  categoryId?: null | number | string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface Product {
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  id?: number | string;
  name?: string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  price?: number | string;
  description?: null | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  userId?: number | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  categoryId?: null | number | string;
  isSold?: boolean;
}

export interface ProductResponseDto {
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  id?: number | string;
  name?: string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  price?: number | string;
  description?: null | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  vendorId?: number | string;
  /** @format date-time */
  purchasedAt?: null | string;
}

export interface PublicProductDto {
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  id?: number | string;
  name?: string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  price?: number | string;
  description?: null | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  vendorId?: number | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  categoryId?: null | number | string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface VendorProductResponseDto {
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  id?: number | string;
  name?: string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  price?: number | string;
  description?: null | string;
  /**
   * @format int32
   * @pattern ^-?(?:0|[1-9]\d*)$
   */
  buyerId?: number | string;
  /** @format date-time */
  soldAt?: null | string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:5118/";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title SatinRoad.Api | v1
 * @version 1.0.0
 * @baseUrl http://localhost:5118/
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Categories
     * @name CategoriesList
     * @request GET:/api/Categories
     */
    categoriesList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Categories`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Categories
     * @name CategoriesCreate
     * @request POST:/api/Categories
     */
    categoriesCreate: (data: CreateCategoryDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Categories`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Categories
     * @name CategoriesDelete
     * @request DELETE:/api/Categories
     */
    categoriesDelete: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        id?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/Categories`,
        method: "DELETE",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsList
     * @request GET:/api/Products
     */
    productsList: (params: RequestParams = {}) =>
      this.request<Product[], any>({
        path: `/api/Products`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsCreate
     * @request POST:/api/Products
     */
    productsCreate: (data: CreateProductDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Products`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsDelete
     * @request DELETE:/api/Products
     */
    productsDelete: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        id?: number | string;
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        userId?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/Products`,
        method: "DELETE",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsByCategoryList
     * @request GET:/api/Products/by-category
     */
    productsByCategoryList: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        categoryId?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicProductDto[], any>({
        path: `/api/Products/by-category`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsByVendorList
     * @request GET:/api/Products/by-vendor
     */
    productsByVendorList: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        vendorId?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicProductDto[], any>({
        path: `/api/Products/by-vendor`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsBuyCreate
     * @request POST:/api/Products/buy
     */
    productsBuyCreate: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        productId?: number | string;
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        buyerId?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/Products/buy`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsBoughtList
     * @request GET:/api/Products/bought
     */
    productsBoughtList: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        userId?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ProductResponseDto[], any>({
        path: `/api/Products/bought`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Products
     * @name ProductsSoldByVendorList
     * @request GET:/api/Products/sold-by-vendor
     */
    productsSoldByVendorList: (
      query?: {
        /**
         * @format int32
         * @pattern ^-?(?:0|[1-9]\d*)$
         */
        vendorId?: number | string;
      },
      params: RequestParams = {},
    ) =>
      this.request<VendorProductResponseDto[], any>({
        path: `/api/Products/sold-by-vendor`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersList
     * @request GET:/api/Users
     */
    usersList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersCreate
     * @request POST:/api/Users
     */
    usersCreate: (data: RegisterDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersLoginCreate
     * @request POST:/api/Users/login
     */
    usersLoginCreate: (data: LoginDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersMeList
     * @request GET:/api/Users/me
     */
    usersMeList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users/me`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersLogoutCreate
     * @request POST:/api/Users/logout
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users/logout`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersTopVendorsList
     * @request GET:/api/Users/top-vendors
     */
    usersTopVendorsList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users/top-vendors`,
        method: "GET",
        ...params,
      }),
  };
}
