import { AxiosRequestConfig } from 'axios';
import {
  CoinMAccountTradeParams,
  CoinMOpenInterest,
  CoinMPositionTrade,
  CoinMSymbolOrderBookTicker,
  PositionRisk,
  SymbolOrPair,
} from './types/coin';
import {
  BasicSymbolPaginatedParams,
  BasicSymbolParam,
  BinanceBaseUrlKey,
  GetOrderParams,
  OrderBookParams,
  HistoricalTradesParams,
  KlinesParams,
  Kline,
  RecentTradesParams,
  CancelOrderParams,
  CancelOCOParams,
  NewOCOParams,
  SymbolFromPaginatedRequestFromId,
  OrderIdProperty,
  GetAllOrdersParams,
  GenericCodeMsgError,
  GetOrderModifyHistoryParams,
  SymbolPrice,
} from './types/shared';

import {
  ContinuousContractKlinesParams,
  IndexPriceKlinesParams,
  SymbolKlinePaginatedParams,
  FuturesDataPaginatedParams,
  NewFuturesOrderParams,
  CancelMultipleOrdersParams,
  CancelOrdersTimeoutParams,
  SetLeverageParams,
  SetMarginTypeParams,
  SetIsolatedMarginParams,
  GetPositionMarginChangeHistoryParams,
  GetIncomeHistoryParams,
  GetForceOrdersParams,
  FuturesExchangeInfo,
  FuturesOrderBook,
  RawFuturesTrade,
  AggregateFuturesTrade,
  FundingRateHistory,
  ModeChangeResult,
  PositionModeParams,
  PositionModeResponse,
  NewOrderResult,
  NewOrderError,
  OrderResult,
  CancelFuturesOrderResult,
  CancelAllOpenOrdersResult,
  SetLeverageResult,
  SetIsolatedMarginResult,
  ForceOrderResult,
  SymbolLeverageBracketsResult,
  IncomeHistory,
  RebateDataOverview,
  SetCancelTimeoutResult,
  ChangeStats24hr,
  MarkPrice,
  FuturesCoinMTakerBuySellVolumeParams,
  FuturesCoinMBasisParams,
  ModifyFuturesOrderResult,
  ModifyFuturesOrderParams,
  OrderAmendment,
  FuturesCoinMAccountBalance,
  FuturesCoinMAccountInformation,
  UserCommissionRate,
} from './types/futures';

import {
  asArray,
  generateNewOrderId,
  getOrderIdPrefix,
  getServerTimeEndpoint,
  logInvalidOrderId,
  RestClientOptions,
} from './util/requestUtils';

import BaseRestClient from './util/BaseRestClient';

export class CoinMClient extends BaseRestClient {
  private clientId: BinanceBaseUrlKey;

  constructor(
    restClientOptions: RestClientOptions = {},
    requestOptions: AxiosRequestConfig = {},
    useTestnet?: boolean,
  ) {
    const clientId = useTestnet ? 'coinmtest' : 'coinm';

    super(clientId, restClientOptions, requestOptions);

    this.clientId = clientId;
    return this;
  }

  /**
   * Abstraction required by each client to aid with time sync / drift handling
   */
  async getServerTime(): Promise<number> {
    return this.get(getServerTimeEndpoint(this.clientId)).then(
      (response) => response.serverTime,
    );
  }

  /**
   *
   * Market Data Endpoints
   *
   **/

  testConnectivity(): Promise<{}> {
    return this.get('dapi/v1/ping');
  }

  getExchangeInfo(): Promise<FuturesExchangeInfo> {
    return this.get('dapi/v1/exchangeInfo');
  }

  getOrderBook(params: OrderBookParams): Promise<FuturesOrderBook> {
    return this.get('dapi/v1/depth', params);
  }

  getRecentTrades(params: RecentTradesParams): Promise<RawFuturesTrade[]> {
    return this.get('dapi/v1/trades', params);
  }

  getHistoricalTrades(
    params: HistoricalTradesParams,
  ): Promise<RawFuturesTrade[]> {
    return this.get('dapi/v1/historicalTrades', params);
  }

  getAggregateTrades(
    params: SymbolFromPaginatedRequestFromId,
  ): Promise<AggregateFuturesTrade[]> {
    return this.get('dapi/v1/aggTrades', params);
  }

  /**
   * Index Price and Mark Price
   */
  getMarkPrice(
    params?: Partial<BasicSymbolParam>,
  ): Promise<MarkPrice | MarkPrice[]> {
    return this.get('dapi/v1/premiumIndex', params);
  }

  getFundingRateHistory(
    params?: Partial<BasicSymbolPaginatedParams>,
  ): Promise<FundingRateHistory[]> {
    return this.get('dapi/v1/fundingRate', params);
  }

  getKlines(params: KlinesParams): Promise<Kline[]> {
    return this.get('dapi/v1/klines', params);
  }

  getContinuousContractKlines(
    params: ContinuousContractKlinesParams,
  ): Promise<Kline[]> {
    return this.get('dapi/v1/continuousKlines', params);
  }

  getIndexPriceKlines(params: IndexPriceKlinesParams): Promise<Kline[]> {
    return this.get('dapi/v1/indexPriceKlines', params);
  }

  getMarkPriceKlines(params: SymbolKlinePaginatedParams): Promise<Kline[]> {
    return this.get('dapi/v1/markPriceKlines', params);
  }

  /**
   * @deprecated use get24hrChangeStatistics() instead (method without the typo)
   */
  get24hrChangeStatististics(
    params?: Partial<BasicSymbolParam>,
  ): Promise<ChangeStats24hr | ChangeStats24hr[]> {
    return this.get24hrChangeStatistics(params);
  }

  get24hrChangeStatistics(
    params?: Partial<BasicSymbolParam>,
  ): Promise<ChangeStats24hr | ChangeStats24hr[]> {
    return this.get('dapi/v1/ticker/24hr', params);
  }

  getSymbolPriceTicker(
    params?: Partial<BasicSymbolParam>,
  ): Promise<SymbolPrice | SymbolPrice[]> {
    return this.get('dapi/v1/ticker/price', params);
  }

  getSymbolOrderBookTicker(
    params?: SymbolOrPair,
  ): Promise<CoinMSymbolOrderBookTicker[]> {
    return this.get('dapi/v1/ticker/bookTicker', params).then((e) =>
      asArray(e),
    );
  }

  getOpenInterest(params: { symbol: string }): Promise<CoinMOpenInterest> {
    return this.get('dapi/v1/openInterest', params);
  }

  getOpenInterestStatistics(params: FuturesDataPaginatedParams): Promise<any> {
    return this.get('futures/data/openInterestHist', params);
  }

  getTopTradersLongShortAccountRatio(
    params: FuturesDataPaginatedParams,
  ): Promise<any> {
    return this.get('futures/data/topLongShortAccountRatio', params);
  }

  getTopTradersLongShortPositionRatio(
    params: FuturesDataPaginatedParams,
  ): Promise<any> {
    return this.get('futures/data/topLongShortPositionRatio', params);
  }

  getGlobalLongShortAccountRatio(
    params: FuturesDataPaginatedParams,
  ): Promise<any> {
    return this.get('futures/data/globalLongShortAccountRatio', params);
  }

  getTakerBuySellVolume(
    params: FuturesCoinMTakerBuySellVolumeParams,
  ): Promise<any> {
    return this.get('futures/data/takerBuySellVol', params);
  }

  getCompositeSymbolIndex(params: FuturesCoinMBasisParams): Promise<any> {
    return this.get('futures/data/basis', params);
  }

  /**
   *
   * USD-Futures Account/Trade Endpoints
   *
   **/

  setPositionMode(params: PositionModeParams): Promise<ModeChangeResult> {
    return this.postPrivate('dapi/v1/positionSide/dual', params);
  }

  getCurrentPositionMode(): Promise<PositionModeResponse> {
    return this.getPrivate('dapi/v1/positionSide/dual');
  }

  submitNewOrder(
    params: NewFuturesOrderParams,
  ): Promise<NewOrderResult> {
    this.validateOrderId(params, 'newClientOrderId');
    return this.postPrivate('dapi/v1/order', params);
  }

  /**
   * Order modify function, currently only LIMIT order modification is supported, modified orders will be reordered in the match queue
   */
  modifyOrder(
    params: ModifyFuturesOrderParams,
  ): Promise<ModifyFuturesOrderResult> {
    return this.putPrivate('dapi/v1/order', params);
  }

  /**
   * Warning: max 5 orders at a time! This method does not throw, instead it returns individual errors in the response array if any orders were rejected.
   *
   * Known issue: `quantity` and `price` should be sent as strings
   */
  submitMultipleOrders(
    orders: NewFuturesOrderParams<string>[],
  ): Promise<(NewOrderResult | NewOrderError)[]> {
    const stringOrders = orders.map((order) => {
      const orderToStringify = { ...order };
      this.validateOrderId(orderToStringify, 'newClientOrderId');
      return JSON.stringify(orderToStringify);
    });
    const requestBody = {
      batchOrders: `[${stringOrders.join(',')}]`,
    };
    return this.postPrivate('dapi/v1/batchOrders', requestBody);
  }

  /**
   * Warning: max 5 orders at a time! This method does not throw, instead it returns individual errors in the response array if any orders were rejected.
   */
  modifyMultipleOrders(
    orders: ModifyFuturesOrderParams[],
  ): Promise<(ModifyFuturesOrderResult | NewOrderError)[]> {
    const stringOrders = orders.map((order) => {
      const orderToStringify = { ...order };
      return JSON.stringify(orderToStringify);
    });
    const requestBody = {
      batchOrders: `[${stringOrders.join(',')}]`,
    };
    return this.putPrivate('dapi/v1/batchOrders', requestBody);
  }

  getOrderModifyHistory(
    params: GetOrderModifyHistoryParams,
  ): Promise<OrderAmendment[]> {
    return this.getPrivate('dapi/v1/orderAmendment', params);
  }

  getOrder(params: GetOrderParams): Promise<OrderResult> {
    return this.getPrivate('dapi/v1/order', params);
  }

  cancelOrder(params: CancelOrderParams): Promise<CancelFuturesOrderResult> {
    return this.deletePrivate('dapi/v1/order', params);
  }

  cancelAllOpenOrders(
    params: BasicSymbolParam,
  ): Promise<CancelAllOpenOrdersResult> {
    return this.deletePrivate('dapi/v1/allOpenOrders', params);
  }

  cancelMultipleOrders(
    params: CancelMultipleOrdersParams,
  ): Promise<(CancelFuturesOrderResult | GenericCodeMsgError)[]> {
    const requestParams: object = {
      ...params,
    };

    if (params.orderIdList) {
      requestParams['orderIdList'] = JSON.stringify(params.orderIdList);
    }

    if (params.origClientOrderIdList) {
      requestParams['origClientOrderIdList'] = JSON.stringify(
        params.origClientOrderIdList,
      );
    }

    return this.deletePrivate('dapi/v1/batchOrders', requestParams);
  }

  // Auto-cancel all open orders
  setCancelOrdersOnTimeout(
    params: CancelOrdersTimeoutParams,
  ): Promise<SetCancelTimeoutResult> {
    return this.postPrivate('dapi/v1/countdownCancelAll', params);
  }

  getCurrentOpenOrder(params: GetOrderParams): Promise<OrderResult> {
    return this.getPrivate('dapi/v1/openOrder', params);
  }

  getAllOpenOrders(params?: Partial<BasicSymbolParam>): Promise<OrderResult[]> {
    return this.getPrivate('dapi/v1/openOrders', params);
  }

  getAllOrders(params: GetAllOrdersParams): Promise<OrderResult[]> {
    return this.getPrivate('dapi/v1/allOrders', params);
  }

  getBalance(): Promise<FuturesCoinMAccountBalance[]> {
    return this.getPrivate('dapi/v1/balance');
  }

  getAccountInformation(): Promise<FuturesCoinMAccountInformation> {
    return this.getPrivate('dapi/v1/account');
  }

  setLeverage(params: SetLeverageParams): Promise<SetLeverageResult> {
    return this.postPrivate('dapi/v1/leverage', params);
  }

  setMarginType(params: SetMarginTypeParams): Promise<ModeChangeResult> {
    return this.postPrivate('dapi/v1/marginType', params);
  }

  setIsolatedPositionMargin(
    params: SetIsolatedMarginParams,
  ): Promise<SetIsolatedMarginResult> {
    return this.postPrivate('dapi/v1/positionMargin', params);
  }

  getPositionMarginChangeHistory(
    params: GetPositionMarginChangeHistoryParams,
  ): Promise<any> {
    return this.getPrivate('dapi/v1/positionMargin/history', params);
  }

  getPositions(): Promise<PositionRisk[]> {
    return this.getPrivate('dapi/v1/positionRisk');
  }

  getAccountTrades(
    params: CoinMAccountTradeParams & { orderId?: number },
  ): Promise<CoinMPositionTrade[]> {
    return this.getPrivate('dapi/v1/userTrades', params);
  }

  getIncomeHistory(params?: GetIncomeHistoryParams): Promise<IncomeHistory[]> {
    return this.getPrivate('dapi/v1/income', params);
  }

  /**
   * Notional Bracket for Symbol (NOT "pair")
   */
  getNotionalAndLeverageBrackets(
    params?: Partial<BasicSymbolParam>,
  ): Promise<SymbolLeverageBracketsResult[] | SymbolLeverageBracketsResult> {
    return this.getPrivate('dapi/v2/leverageBracket', params);
  }

  getForceOrders(params?: GetForceOrdersParams): Promise<ForceOrderResult[]> {
    return this.getPrivate('dapi/v1/forceOrders', params);
  }

  getADLQuantileEstimation(params?: Partial<BasicSymbolParam>): Promise<any> {
    return this.getPrivate('dapi/v1/adlQuantile', params);
  }

  getAccountComissionRate(
    params: BasicSymbolParam,
  ): Promise<UserCommissionRate> {
    return this.getPrivate('dapi/v1/commissionRate', params);
  }

  /**
   *
   * Broker Futures Endpoints
   *
   **/

  // 1 == USDT-Margined, 2 == Coin-margined
  getBrokerIfNewFuturesUser(
    brokerId: string,
    type: 1 | 2 = 1,
  ): Promise<{ brokerId: string; rebateWorking: boolean; ifNewUser: boolean }> {
    return this.getPrivate('dapi/v1/apiReferral/ifNewUser', {
      brokerId,
      type,
    });
  }

  setBrokerCustomIdForClient(
    customerId: string,
    email: string,
  ): Promise<{ customerId: string; email: string }> {
    return this.postPrivate('dapi/v1/apiReferral/customization', {
      customerId,
      email,
    });
  }

  getBrokerClientCustomIds(
    customerId: string,
    email: string,
    page?: number,
    limit?: number,
  ): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/customization', {
      customerId,
      email,
      page,
      limit,
    });
  }

  getBrokerUserCustomId(brokerId: string): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/userCustomization', {
      brokerId,
    });
  }

  getBrokerRebateDataOverview(type: 1 | 2 = 1): Promise<RebateDataOverview> {
    return this.getPrivate('dapi/v1/apiReferral/overview', {
      type,
    });
  }

  getBrokerUserTradeVolume(
    type: 1 | 2 = 1,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/tradeVol', {
      type,
      startTime,
      endTime,
      limit,
    });
  }

  getBrokerRebateVolume(
    type: 1 | 2 = 1,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/rebateVol', {
      type,
      startTime,
      endTime,
      limit,
    });
  }

  getBrokerTradeDetail(
    type: 1 | 2 = 1,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<any> {
    return this.getPrivate('dapi/v1/apiReferral/traderSummary', {
      type,
      startTime,
      endTime,
      limit,
    });
  }

  /**
   *
   * User Data Stream Endpoints
   *
   **/

  getFuturesUserDataListenKey(): Promise<{ listenKey: string }> {
    return this.post('dapi/v1/listenKey');
  }

  keepAliveFuturesUserDataListenKey(): Promise<{}> {
    return this.put('dapi/v1/listenKey');
  }

  closeFuturesUserDataListenKey(): Promise<{}> {
    return this.delete('dapi/v1/listenKey');
  }

  /**
   * Validate syntax meets requirements set by binance. Log warning if not.
   */
  private validateOrderId(
    params:
      | NewFuturesOrderParams
      | CancelOrderParams
      | NewOCOParams
      | CancelOCOParams,
    orderIdProperty: OrderIdProperty,
  ): void {
    const apiCategory = this.clientId;
    if (!params[orderIdProperty]) {
      params[orderIdProperty] = generateNewOrderId(apiCategory);
      return;
    }

    const expectedOrderIdPrefix = `x-${getOrderIdPrefix(apiCategory)}`;
    if (!params[orderIdProperty].startsWith(expectedOrderIdPrefix)) {
      logInvalidOrderId(orderIdProperty, expectedOrderIdPrefix, params);
    }
  }
}
